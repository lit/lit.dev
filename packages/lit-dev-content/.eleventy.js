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

// Use the same slugify as 11ty for markdownItAnchor. It's similar to Jekyll,
// and preserves the existing URL fragments
const slugify = (s) => slugifyLib(s, {lower: true});

const DEV = process.env.ELEVENTY_ENV === 'dev';
const OUTPUT_DIR = DEV ? '_dev' : '_site';

module.exports = function (eleventyConfig) {
  // https://github.com/JordanShurmer/eleventy-plugin-toc#readme
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3'],
    wrapper: 'div',
    wrapperClass: '',
  });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(playgroundPlugin);
  if (!DEV) {
    // In dev mode, we symlink directly to the source CSS.
    eleventyConfig.addPassthroughCopy('site/css');
  }
  eleventyConfig.addPassthroughCopy('site/images/**/*');
  eleventyConfig.addPassthroughCopy('api/**/*');
  eleventyConfig.addPassthroughCopy({'site/_includes/projects': 'samples'});
  eleventyConfig.addPassthroughCopy({
    'node_modules/playground-elements/playground-typescript-worker.js':
      './js/playground-typescript-worker.js',
  });
  eleventyConfig.addPassthroughCopy({
    'node_modules/playground-elements/playground-service-worker.js':
      './js/playground-service-worker.js',
  });
  eleventyConfig.addPassthroughCopy({
    'node_modules/playground-elements/playground-service-worker-proxy.html':
      './js/playground-service-worker-proxy.html',
  });

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

  const md = markdownIt({
    html: true,
    breaks: false, // 2 newlines for paragraph break instead of 1
    linkify: true,
  })
    .use(markdownItAttrs)
    .use(markdownItAnchor, {slugify, permalink: false});
  eleventyConfig.setLibrary('md', md);

  eleventyConfig.addFilter('removeExtension', function (url) {
    const extension = path.extname(url);
    return url.substring(0, url.length - extension.length);
  });

  eleventyConfig.addCollection('guide', function (collection) {
    // Order the 'guide' collection by filename, which includes a number prefix.
    // We could also order by a frontmatter property
    // console.log(
    //   'guide',
    //   collection.getFilteredByGlob('site/guide/**')
    //     .map((f) => `${f.inputPath}, ${f.fileSlug}, ${f.data.slug}, ${f.data.slug.includes('/')}`));

    return (
      collection
        .getFilteredByGlob('site/guide/**')
        // .filter((f) => !f.data.slug?.includes('/'))
        .sort(function (a, b) {
          if (a.fileSlug == 'guide') {
            return -1;
          }
          if (a.fileSlug < b.fileSlug) {
            return -1;
          }
          if (b.fileSlug < a.fileSlug) {
            return 1;
          }
          return 0;
        })
    );
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
   * to ./site/_includes/js/ directory (which is where Rollup output goes).
   *
   * In dev mode, instead directly import the module relative from ./lib/ (which
   * is where TypeScript output goes).
   */
  eleventyConfig.addShortcode('inlinejs', (path) => {
    if (DEV) {
      return `<script type="module" src="/lib/${path}"></script>`;
    }
    const script = fsSync.readFileSync(`site/_includes/js/${path}`, 'utf8');
    return `<script type="module">${script}</script>`;
  });

  eleventyConfig.on('afterBuild', async () => {
    // The eleventyNavigation plugin requires that each section heading in our
    // docs has its own actual markdown file. But we don't actually use these
    // for content, they only exist to generate sections. Delete the HTML files
    // generated from them so that users can't somehow navigate to some
    // "index.html" and see a weird empty page.
    const emptyDocsIndexFiles = (
      await fastGlob([
        OUTPUT_DIR + '/guide/introduction.html',
        OUTPUT_DIR + '/guide/*/index.html',
      ])
    ).filter(
      // TODO(aomarks) This is brittle, we need a way to annotate inside an md
      // file that a page shouldn't be generated.
      (file) => !file.includes('why-lit') && !file.includes('getting-started')
    );
    await Promise.all(emptyDocsIndexFiles.map((path) => fs.unlink(path)));

    if (DEV) {
      // Symlink site/css -> _dev/css. We do this in dev mode instead of
      // addPassthroughCopy() so that changes are reflected immediately, instead
      // of triggering an Eleventy build.
      await symlinkForce(
        path.join(__dirname, 'site', 'css'),
        path.join(__dirname, '_dev', 'css')
      );

      // Symlink lib -> _dev/lib. This lets us directly reference tsc outputs in
      // dev mode, instead of the Rollup bundles we use for production.
      await symlinkForce(
        path.join(__dirname, 'lib'),
        path.join(__dirname, '_dev', 'lib')
      );
    }
  });

  return {
    dir: {input: 'site', output: OUTPUT_DIR},
    htmlTemplateEngine: 'njk',
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
