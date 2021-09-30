const markdownIt = require('markdown-it');
const pluginTOC = require('eleventy-plugin-nesting-toc');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const slugifyLib = require('slugify');
const path = require('path');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const {
  playgroundPlugin,
} = require('lit-dev-tools/lib/playground-plugin/plugin.js');
const htmlMinifier = require('html-minifier');
const CleanCSS = require('clean-css');
const fs = require('fs/promises');
const fsSync = require('fs');
const fastGlob = require('fast-glob');
const {
  inlinePlaygroundFilesIntoManifests,
} = require('../lit-dev-tools/lib/playground-inline.js');
const {createSearchIndex} = require('../lit-dev-tools/lib/search/plugin.js');
const {preCompress} = require('../lit-dev-tools/lib/pre-compress.js');
const luxon = require('luxon');
const crypto = require('crypto');

// Use the same slugify as 11ty for markdownItAnchor. It's similar to Jekyll,
// and preserves the existing URL fragments
const slugify = (s) => slugifyLib(s, {lower: true});

const DEV = process.env.ELEVENTY_ENV === 'dev';
const OUTPUT_DIR = DEV ? '_dev' : '_site';
const PLAYGROUND_SANDBOX =
  process.env.PLAYGROUND_SANDBOX || 'http://localhost:6416/';

const cspInlineScriptHashes = new Set();

module.exports = function (eleventyConfig) {
  // https://github.com/JordanShurmer/eleventy-plugin-toc#readme
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3'],
    wrapper: 'div',
    wrapperClass: '',
  });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(playgroundPlugin, {
    sandboxUrl: PLAYGROUND_SANDBOX,
  });
  if (!DEV) {
    // In dev mode, we symlink these directly to source.
    eleventyConfig.addPassthroughCopy({'rollupout/': './js/'});
    eleventyConfig.addPassthroughCopy('site/css');
    eleventyConfig.addPassthroughCopy('site/fonts');
    eleventyConfig.addPassthroughCopy('site/images');
    eleventyConfig.addPassthroughCopy('samples');
    // The Playground web worker is loaded directly from the main origin, so it
    // should be in our js directory. We don't need the service worker, though,
    // because that will be served directly out of node_modules/ by the
    // dedicated Playground sandbox server.
    eleventyConfig.addPassthroughCopy({
      'node_modules/playground-elements/playground-typescript-worker.js':
        './js/playground-typescript-worker.js',
    });
  }
  eleventyConfig.addPassthroughCopy('api/**/*');

  eleventyConfig.addWatchTarget('../lit-dev-api/api-data');

  // Placeholder shortcode for TODOs
  // Formatting is intentional: outdenting the HTML causes the
  // markdown processor to quote it.
  eleventyConfig.addPairedShortcode('todo', function (content) {
    console.warn(`TODO item in ${this.page.url}`);
    return `
<div class="alert alert-todo">
<h3>TO DO</h3>

${content}

</div>`;
  });

  const linkAfterHeaderBase = markdownItAnchor.permalink.linkAfterHeader({
    style: 'visually-hidden',
    class: 'anchor',
    visuallyHiddenClass: 'offscreen',
    assistiveText: (title) => `Permalink to “${title}”`,
  });

  /**
   * The built-in linkAfterHeader permalink renderer is almost exactly what we
   * need for accessible permalinks, except it doesn't put a wrapper element
   * around the header + anchor link, so they won't appear on the same line.
   *
   * This function fixes up the base renderer to do so, based on the comment at
   * https://github.com/valeriangalliat/markdown-it-anchor/issues/100#issuecomment-906745405.
   */
  const linkAfterHeaderWithWrapper = (slug, opts, state, idx) => {
    const headingTag = state.tokens[idx].tag;
    if (!headingTag.match(/^h[123456]$/)) {
      throw new Error(`Expected token to be a h1-6: ${headingTag}`);
    }
    state.tokens.splice(
      idx,
      0,
      Object.assign(new state.Token('div_open', 'div', 1), {
        attrs: [['class', `heading ${headingTag}`]],
        block: true,
      })
    );
    state.tokens.splice(
      idx + 4,
      0,
      Object.assign(new state.Token('div_close', 'div', -1), {
        block: true,
      })
    );
    linkAfterHeaderBase(slug, opts, state, idx + 1);
  };

  const md = markdownIt({
    html: true,
    breaks: false, // 2 newlines for paragraph break instead of 1
    linkify: true,
  })
    .use(markdownItAttrs)
    .use(markdownItAnchor, {
      slugify,
      permalink: linkAfterHeaderWithWrapper,
      permalinkClass: 'anchor',
      permalinkSymbol: '#',
      level: [2, 3],
    });
  eleventyConfig.setLibrary('md', md);

  eleventyConfig.addFilter('removeExtension', function (url) {
    const extension = path.extname(url);
    return url.substring(0, url.length - extension.length);
  });

  const docsByUrl = new Map();
  eleventyConfig.addCollection('docs', function (collection) {
    const docs = collection
      .getFilteredByGlob('site/docs/**')
      .sort(function (a, b) {
        if (a.fileSlug == 'docs') {
          return -1;
        }
        if (a.fileSlug < b.fileSlug) {
          return -1;
        }
        if (b.fileSlug < a.fileSlug) {
          return 1;
        }
        return 0;
      });
    for (const page of docs) {
      docsByUrl.set(page.url, page);
    }
    return docs;
  });

  // The reverse filter isn't working in Liquid templates
  eleventyConfig.addCollection('releasenotes', function (collection) {
    return collection.getFilteredByTag('release').reverse();
  });

  eleventyConfig.addTransform('htmlMinify', function (content, outputPath) {
    if (DEV || !outputPath.endsWith('.html')) {
      return content;
    }
    const minified = htmlMinifier.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    });
    return minified;
  });

  /**
   * Flatten a navigation object into an array, and add "next" and "prev"
   * properties.
   *
   * See https://github.com/11ty/eleventy-navigation/issues/22
   */
  eleventyConfig.addFilter('flattenNavigationAndAddNextPrev', (nav) => {
    const flat = [];
    // TODO(aomarks) For an unknown reason, every page in the "Templates"
    // section is duplicated in the nav. Doesn't affect any other section. Just
    // de-dupe by URL for now.
    const seen = new Set();
    const visit = (items) => {
      for (const item of items) {
        if (seen.has(item.url)) {
          continue;
        }
        seen.add(item.url);
        flat.push(item);
        visit(item.children);
      }
    };
    visit(nav);
    for (let i = 0; i < flat.length; i++) {
      const item = flat[i];
      item.prev = flat[i - 1];
      item.next = flat[i + 1];
    }
    return flat;
  });

  /**
   * Gets the title given a docs URL.
   */
  eleventyConfig.addFilter('docsUrlTitle', (url) => {
    return docsByUrl.get(url)?.data?.title;
  });

  /**
   * Render the given content as markdown.
   */
  eleventyConfig.addFilter('markdown', (content) => {
    if (!content) {
      return '';
    }
    return md.render(content);
  });

  /**
   * Render the `typeof` of the given value.
   */
  eleventyConfig.addFilter('typeof', (value) => typeof value);

  /**
   * Return whether the given table-of-contents HTML includes at least one <a>
   * tag. It always renders a surrounding <nav> element, even when there are no
   * items.
   */
  eleventyConfig.addFilter('tocHasEntries', (html) => {
    return html.includes('<a');
  });

  // Don't use require() because of Node caching in watch mode.
  const apiSymbolMap = JSON.parse(
    fsSync.readFileSync('../lit-dev-api/api-data/symbols.json', 'utf8')
  );

  /**
   * Generate a hyperlink to the given API symbol.
   *
   * The first parameter is the link display text, and if there is no second
   * parameter it is also the symbol to look up. If there is a second parameter,
   * then that will be used for the symbol look up instead of the first
   * parameter.
   *
   * Symbols are indexed in both concise and disambiguated forms. If a symbol is
   * ambiguous, an error will be thrown during Eleventy build, with
   * disambiguation suggestions.
   *
   * Examples:
   *
   *   renderRoot .............................. OK (not ambiguous)
   *   ReactiveElement.renderRoot .............. OK
   *
   *   updateComplete .......................... ERROR (ambiguous)
   *   ReactiveElement.updateComplete .......... OK
   *   ReactiveControllerHost.updateComplete ... OK
   *
   *   render .................................. OK (top-level function)
   *   LitElement.render ....................... OK (method)
   */
  eleventyConfig.addShortcode('api', (name, symbol) => {
    symbol = symbol ?? name;
    const locations = apiSymbolMap['$' + symbol];
    if (!locations) {
      throw new Error(`Could not find API link for symbol ${symbol}`);
    }

    let location;
    if (locations.length === 1) {
      // Unambiguous match
      location = locations[0];
    } else {
      for (const option of locations) {
        // Exact match.

        // TODO(aomarks) It could be safer to always fail when ambiguous, but we
        // currently don't have an unambiguous reference for the top-level
        // "render" function. Maybe we could use the filename, e.g.
        // "lit-html.render".
        if (option.anchor === symbol) {
          location = option;
          break;
        }
      }
    }

    if (location === undefined) {
      throw new Error(
        `Ambiguous symbol ${symbol}. ` +
          `Options: ${locations.map((l) => l.anchor).join(', ')}`
      );
    }

    const {page, anchor} = location;
    return `<a href="/docs/api/${page}#${anchor}">${name}</a>`;
  });

  /**
   * Bundle, minify, and inline a CSS file. Path is relative to ./site/css/.
   *
   * In dev mode, instead import the CSS file directly.
   */
  eleventyConfig.addShortcode('inlinecss', (path) => {
    if (DEV) {
      return `<link rel="stylesheet" href="/css/${path}">`;
    }
    const result = new CleanCSS({inline: ['local']}).minify([
      `./site/css/${path}`,
    ]);
    if (result.errors.length > 0 || result.warnings.length > 0) {
      throw new Error(
        `CleanCSS errors/warnings on file ${path}:\n\n${[
          ...result.errors,
          ...result.warnings,
        ].join('\n')}`
      );
    }
    return `<style>${result.styles}</style>`;
  });

  /**
   * Inline the Rollup-bundled version of a JavaScript module. Path is relative
   * to ./rollupout.
   *
   * In dev mode, instead directly import the module, which has already been
   * symlinked directly to the TypeScript output directory.
   */
  eleventyConfig.addShortcode('inlinejs', (path) => {
    if (DEV) {
      return `<script type="module" src="/js/${path}"></script>`;
    }
    // Note we must trim before hashing, because our html-minifier will trim
    // inline script trailing newlines, and otherwise our hash will be wrong.
    const script = fsSync.readFileSync(`rollupout/${path}`, 'utf8').trim();
    const hash =
      'sha256-' + crypto.createHash('sha256').update(script).digest('base64');
    cspInlineScriptHashes.add(hash);
    return `<script type="module">${script}</script>`;
  });

  // Source: https://github.com/11ty/eleventy-base-blog/blob/master/.eleventy.js
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return luxon.DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(
      'LLL d, yyyy'
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return luxon.DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(
      'yyyy-LL-dd'
    );
  });

  eleventyConfig.on('beforeBuild', () => {
    cspInlineScriptHashes.clear();
  });

  eleventyConfig.on('afterBuild', async () => {
    // The eleventyNavigation plugin requires that each section heading in our
    // docs has its own actual markdown file. But we don't actually use these
    // for content, they only exist to generate sections. Delete the HTML files
    // generated from them so that users can't somehow navigate to some
    // "index.html" and see a weird empty page.
    const emptyDocsIndexFiles = (
      await fastGlob([
        OUTPUT_DIR + '/docs/introduction.html',
        OUTPUT_DIR + '/docs/*/index.html',
      ])
    ).filter(
      // TODO(aomarks) This is brittle, we need a way to annotate inside an md
      // file that a page shouldn't be generated.
      (file) =>
        !file.includes('why-lit') &&
        !file.includes('getting-started') &&
        !file.includes('browser-support')
    );
    await Promise.all(emptyDocsIndexFiles.map((path) => fs.unlink(path)));

    await createSearchIndex(OUTPUT_DIR);

    if (DEV) {
      // Symlink css, images, and playground projects. We do this in dev mode
      // instead of addPassthroughCopy() so that changes are reflected
      // immediately, instead of triggering an Eleventy build.
      await symlinkForce(
        path.join(__dirname, 'site', 'css'),
        path.join(__dirname, '_dev', 'css')
      );
      await symlinkForce(
        path.join(__dirname, 'site', 'images'),
        path.join(__dirname, '_dev', 'images')
      );
      await symlinkForce(
        path.join(__dirname, 'site', 'fonts'),
        path.join(__dirname, '_dev', 'fonts')
      );
      await symlinkForce(
        path.join(__dirname, 'samples'),
        path.join(__dirname, '_dev', 'samples')
      );

      // Symlink lib -> _dev/js. This lets us directly reference tsc outputs in
      // dev mode, instead of the Rollup bundles we use for production.
      await symlinkForce(
        path.join(__dirname, 'lib'),
        path.join(__dirname, '_dev', 'js')
      );
    } else {
      // Inline all Playground project files directly into their manifests, to
      // cut down on requests per project.
      await inlinePlaygroundFilesIntoManifests(
        `${OUTPUT_DIR}/samples/**/project.json`
      );

      // Pre-compress all outputs as .br and .gz files so the server can read
      // them directly instead of spending its own cycles. Note this adds ~4
      // seconds to the build, but it's disabled during dev.
      await preCompress({glob: `${OUTPUT_DIR}/**/*`});

      // Note we only need to write CSP inline script hashes for the production
      // output, because in dev mode we don't inline scripts.
      await fs.writeFile(
        path.join(OUTPUT_DIR, 'csp-inline-script-hashes.txt'),
        [...cspInlineScriptHashes].join('\n'),
        'utf8'
      );
    }
  });

  eleventyConfig.addCollection('tutorial', function (collection) {
    return collection
      .getFilteredByGlob('site/tutorial/**')
      .sort(function (a, b) {
        if (a.fileSlug == 'tutorial') {
          return -1;
        }
        if (a.fileSlug < b.fileSlug) {
          return -1;
        }
        if (b.fileSlug < a.fileSlug) {
          return 1;
        }
        return 0;
      });
  });

  return {
    dir: {input: 'site', output: OUTPUT_DIR},
    htmlTemplateEngine: 'njk',
    // TODO: Switch markdown to Nunjucks
    // markdownTemplateEngine: 'njk',
  };
};

const unlinkIfExists = async (path) => {
  try {
    await fs.unlink(path);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
};

const symlinkForce = async (target, path) => {
  await unlinkIfExists(path);
  await fs.symlink(target, path);
};
