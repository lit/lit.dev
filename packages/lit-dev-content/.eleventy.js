/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const ENV =
  require('lit-dev-tools-cjs/lib/lit-dev-environments.js').getEnvironment();

const markdownIt = require('markdown-it');
const pluginTOC = require('eleventy-plugin-nesting-toc');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const slugifyLib = require('slugify');
const path = require('path');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const {
  playgroundPlugin,
} = require('lit-dev-tools-cjs/lib/playground-plugin/plugin.js');
const htmlMinifier = require('html-minifier');
const CleanCSS = require('clean-css');
const fs = require('fs/promises');
const fsSync = require('fs');
const fastGlob = require('fast-glob');
const {
  inlinePlaygroundFilesIntoManifests,
} = require('../lit-dev-tools-cjs/lib/playground-inline.js');
const {
  createSearchIndex,
} = require('../lit-dev-tools-cjs/lib/search/plugin.js');
const {preCompress} = require('../lit-dev-tools-cjs/lib/pre-compress.js');
const luxon = require('luxon');
const crypto = require('crypto');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const litPlugin = require('@lit-labs/eleventy-plugin-lit');

// Use the same slugify as 11ty for markdownItAnchor. It's similar to Jekyll,
// and preserves the existing URL fragments
const slugify = (s) => slugifyLib(s, {lower: true});

const DEV = ENV.eleventyMode === 'dev';

const cspInlineScriptHashes = new Set();

/**
 * @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 * @returns {ReturnType<import("@11ty/eleventy/src/defaultConfig")>}
 */
module.exports = function (eleventyConfig) {
  // https://github.com/JordanShurmer/eleventy-plugin-toc#readme
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3'],
    wrapper: 'div',
    wrapperClass: '',
  });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(playgroundPlugin, {
    sandboxUrl: ENV.playgroundSandboxUrl,
    isDevMode: DEV,
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
      [require.resolve('playground-elements/playground-typescript-worker.js')]:
        './js/playground-typescript-worker.js',
    });
  }
  eleventyConfig.addPassthroughCopy('api/**/*');

  eleventyConfig.addWatchTarget('../lit-dev-api/api-data/*/*.json');
  eleventyConfig.addWatchTarget(
    '../lit-dev-content/samples/tutorials/**/tutorial.json'
  );
  eleventyConfig.addWatchTarget('../lit-dev-content/samples/tutorials/**/*.md');
  eleventyConfig.addWatchTarget('../lit-dev-content/rollupout/server/*');
  eleventyConfig.addWatchTarget('../lit-dev-content/lib/components/ssr.js');

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

  eleventyConfig.addPlugin(pluginRss);

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
      level: [2, 3, 4],
    });
  eleventyConfig.setLibrary('md', md);

  /**
   * Sometimes we don't want automatically generated heading anchors, like blog
   * articles. But it's not possible to change markdown settings on a per-page
   * basis (!). This filter just removes the anchor elements after rendering
   * instead.
   */
  eleventyConfig.addFilter('removeHeadingAnchors', function (content) {
    return content.replace(/<a class="anchor".*<\/a>/g, '');
  });

  /**
   * For the latest versioned urls, this filter returns the unversioned url
   * which is used in the rel=canonical link.
   */
  eleventyConfig.addFilter(
    'removeLatestVersionFromUrl',
    function (url, latestVersion) {
      if (!latestVersion) {
        throw new Error(
          `No latestVersion provided to 'removeLatestVersionFromUrl`
        );
      }
      if (!url.includes(`/${latestVersion}/`)) {
        throw new Error(
          `'${url}' does not include the latestVersion versioned path segment`
        );
      }
      return url.replace(`/${latestVersion}/`, '/');
    }
  );

  /**
   * All docs/* content on lit.dev is versioned. So all cross links are
   * versioned. We automatically generate unversioned docs from the latest Lit
   * version. This filter fixes the cross linking such that links on unversioned
   * pages link to other unversioned pages.
   */
  eleventyConfig.addFilter(
    'fixUnversionedCrossLinks',
    function (content, isUnversionedUrl, latestVersion) {
      if (!isUnversionedUrl) {
        return content;
      }
      if (!latestVersion) {
        throw new Error(
          `latestVersion not provided to 'fixUnversionedCrossLinks`
        );
      }
      return content.replaceAll(`/docs/${latestVersion}/`, '/docs/');
    }
  );

  eleventyConfig.addFilter('removeExtension', function (url) {
    const extension = path.extname(url);
    return url.substring(0, url.length - extension.length);
  });

  // used for debugging and printing out data in the console
  eleventyConfig.addFilter('debug', function (value) {
    console.log(value);
    return value;
  });

  eleventyConfig.addFilter('videosToAlgoliaRecords', function (videos) {
    return videos.map((video) => {
      return {
        relativeUrl: video.url,
        title: video.title,
        heading: '',
        text: video.summary,
        docType: {
          type: 'Video',
          tag: 'video',
        },
        isExternal: true,
      };
    });
  });

  const sortDocs = (a, b) => {
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
  };

  const documentByUrl = new Map();

  eleventyConfig.addCollection('docs-v1', function (collection) {
    const docs = collection.getFilteredByGlob('site/docs/v1/**').sort(sortDocs);
    for (const page of docs) {
      documentByUrl.set(page.url, page);
    }
    return docs;
  });

  eleventyConfig.addCollection('docs-v2', function (collection) {
    const docs = collection
      .getFilteredByGlob(['site/docs/v2/**'])
      .sort(sortDocs);
    for (const page of docs) {
      documentByUrl.set(page.url, page);
    }
    return docs;
  });

  eleventyConfig.addCollection('docs-v3', function (collection) {
    const docs = collection
      .getFilteredByGlob(['site/docs/v3/**'])
      .sort(sortDocs);
    for (const page of docs) {
      documentByUrl.set(page.url, page);
    }
    return docs;
  });

  // Collection that contains the built duplicate docs for the current
  // recommended version of Lit.
  eleventyConfig.addCollection('docs-unversioned', function (collection) {
    const docs = collection
      .getFilteredByGlob(['site/docs/unversioned/**'])
      .sort(sortDocs);
    for (const page of docs) {
      documentByUrl.set(page.url, page);
    }
    return docs;
  });

  const sortArticles = (a, b) => {
    const aDate = new Date(a.data.lastUpdated ?? a.data.publishDate);
    const bDate = new Date(b.data.lastUpdated ?? b.data.publishDate);
    // note this is reversed because we want the most recent articles first
    return bDate - aDate;
  };

  eleventyConfig.addCollection('article', function (collection) {
    // get the articles and sort them by date. This sort is only used on the
    // article-feed views
    const docs = collection
      .getFilteredByGlob('site/articles/article/**')
      .sort(sortArticles);
    for (const page of docs) {
      documentByUrl.set(page.url, page);
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
   * Gets the title given a document URL.
   */
  eleventyConfig.addFilter('documentUrlTitle', (url) => {
    return documentByUrl.get(url)?.data?.title;
  });

  /**
   * Render the given content as markdown, with HTML disabled.
   */
  eleventyConfig.addFilter('markdownWithoutHtml', (content) => {
    if (!content) {
      return '';
    }
    // We should be able to create two markdownit instances -- one that allows
    // HTML and one that doesn't -- but for some reason having two (even when
    // configured the same way!) disables syntax highlighting. Maybe there's a
    // bug in markdownit where there's some global state? Toggling HTML off and
    // on in here does work, though.
    const htmlBefore = md.options.html;
    md.set({html: false});
    const result = md.render(content);
    md.set({html: htmlBefore});
    return result;
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
  const addApiShortcode = (shortcodeName, docsRoot, apiSymbolMap) => {
    eleventyConfig.addShortcode(shortcodeName, (name, symbol) => {
      symbol = symbol ?? name;
      if (symbol.startsWith('@')) {
        // Decorators aren't indexed including the `@` syntax, but we often
        // refer to them that way.
        symbol = symbol.substring(1);
      }
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
      return `<code><a href="${docsRoot}/${page}#${anchor}">${name}</a></code>`;
    });
  };

  addApiShortcode(
    'api-v3',
    '/docs/v3/api',
    JSON.parse(
      fsSync.readFileSync('../lit-dev-api/api-data/lit-3/symbols.json', 'utf8')
    )
  );

  addApiShortcode(
    'api',
    '/docs/v2/api',
    // Don't use require() because of Node caching in watch mode.
    JSON.parse(
      fsSync.readFileSync('../lit-dev-api/api-data/lit-2/symbols.json', 'utf8')
    )
  );

  addApiShortcode(
    'api-lit-html-1',
    '/docs/v1/api/lit-html',
    JSON.parse(
      fsSync.readFileSync(
        '../lit-dev-api/api-data/lit-html-1/symbols.json',
        'utf8'
      )
    )
  );

  addApiShortcode(
    'api-lit-element-2',
    '/docs/v1/api/lit-element',
    JSON.parse(
      fsSync.readFileSync(
        '../lit-dev-api/api-data/lit-element-2/symbols.json',
        'utf8'
      )
    )
  );

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

  eleventyConfig.addNunjucksAsyncShortcode('algoliaid', async () => {
    const {publicVars} = await import('lit-dev-tools-esm/lib/configs.js');
    return publicVars.algolia.appId;
  });

  // Source: https://github.com/11ty/eleventy-base-blog/blob/master/.eleventy.js
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return luxon.DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(
      'LLL d, yyyy'
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('yyyymmdd', (dateObj) => {
    return luxon.DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(
      'yyyy-LL-dd'
    );
  });

  eleventyConfig.on('eleventy.before', () => {
    cspInlineScriptHashes.clear();
  });

  eleventyConfig.on('eleventy.after', async () => {
    // The eleventyNavigation plugin requires that each section heading in our
    // docs has its own actual markdown file. But we don't actually use these
    // for content, they only exist to generate sections. Delete the HTML files
    // generated from them so that users can't somehow navigate to some
    // "index.html" and see a weird empty page.
    const emptyDocsIndexFiles = (
      await fastGlob(
        [
          ENV.eleventyOutDir + '/docs/introduction.html',
          ENV.eleventyOutDir + '/docs/*/index.html',
          ENV.eleventyOutDir + '/docs/v1/introduction.html',
          ENV.eleventyOutDir + '/docs/v1/*/index.html',
          ENV.eleventyOutDir + '/docs/v2/introduction.html',
          ENV.eleventyOutDir + '/docs/v2/*/index.html',
          ENV.eleventyOutDir + '/docs/v3/introduction.html',
          ENV.eleventyOutDir + '/docs/v3/*/index.html',
        ],
        {ignore: ENV.eleventyOutDir + '/docs/(v1|v2|v3)/index.html'}
      )
    ).filter(
      // TODO(aomarks) This is brittle, we need a way to annotate inside an md
      // file that a page shouldn't be generated.
      (file) =>
        !file.includes('why-lit') &&
        !file.includes('getting-started') &&
        !file.includes('browser-support')
    );
    await Promise.all(emptyDocsIndexFiles.map((path) => fs.unlink(path)));

    if (!DEV) {
      // Only create the search index in production when we'll be uploading it
      // to algolia.
      await createSearchIndex(ENV.eleventyOutDir);
    }

    if (DEV) {
      // Symlink css, images, and playground projects. We do this in dev mode
      // instead of addPassthroughCopy() so that changes are reflected
      // immediately, instead of triggering an Eleventy build.
      await symlinkForce(
        path.join(__dirname, 'site', 'css'),
        path.join(__dirname, ENV.eleventyOutDir, 'css')
      );
      await symlinkForce(
        path.join(__dirname, 'site', 'images'),
        path.join(__dirname, ENV.eleventyOutDir, 'images')
      );
      await symlinkForce(
        path.join(__dirname, 'site', 'fonts'),
        path.join(__dirname, ENV.eleventyOutDir, 'fonts')
      );
      await symlinkForce(
        path.join(__dirname, 'samples'),
        path.join(__dirname, ENV.eleventyOutDir, 'samples')
      );

      // Symlink lib -> _dev/js. This lets us directly reference tsc outputs in
      // dev mode, instead of the Rollup bundles we use for production.
      await symlinkForce(
        path.join(__dirname, 'lib'),
        path.join(__dirname, ENV.eleventyOutDir, 'js')
      );
    } else {
      // Inline all Playground project files directly into their manifests, to
      // cut down on requests per project.
      await inlinePlaygroundFilesIntoManifests(
        `${ENV.eleventyOutDir}/samples/**/project.json`
      );

      // Pre-compress all outputs as .br and .gz files so the server can read
      // them directly instead of spending its own cycles. Note this adds ~4
      // seconds to the build, but it's disabled during dev.
      await preCompress({glob: `${ENV.eleventyOutDir}/**/*`});

      // Note we only need to write CSP inline script hashes for the production
      // output, because in dev mode we don't inline scripts.
      await fs.writeFile(
        path.join(ENV.eleventyOutDir, 'csp-inline-script-hashes.txt'),
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

  let componentModules = ['lib/components/ssr.js'];

  // In prod SSR should use the lit templates run through the minifier.
  if (!DEV) {
    componentModules = componentModules.map((componentPath) =>
      componentPath.replace('lib/components', 'rollupout/server')
    );
  }

  eleventyConfig.addPlugin(litPlugin, {
    componentModules,
    ignoreGlobs: ['**/tutorials/content/**/*'],
    mode: 'vm',
  });

  return {
    dir: {input: 'site', output: ENV.eleventyOutDir},
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
