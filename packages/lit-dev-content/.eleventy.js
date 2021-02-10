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

// Use the same slugify as 11ty for markdownItAnchor. It's similar to Jekyll,
// and preserves the existing URL fragments
const slugify = (s) => slugifyLib(s, {lower: true});

const DEV = process.env.ELEVENTY_ENV === 'dev';

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
  // Note we don't want codemirror.css in css/ because in dev mode it's a
  // symlink, and we don't want to accidentally copy this file into site/css.
  eleventyConfig.addPassthroughCopy({
    'node_modules/codemirror/lib/codemirror.css': './codemirror.css',
  });
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

  const md = markdownIt({html: true, breaks: false, linkify: true})
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

  /**
   * HACK: The TOC plugin adds an "active" class to headings, but not to the
   * parent heading, if it's nested. We need a class on the parent of the active
   * heading too, because we highlight it.
   */
  eleventyConfig.addTransform('tocHack', function (content, outputPath) {
    if (!outputPath.endsWith('.html') || !content.includes('lhs-nav')) {
      return content;
    }
    return content.replace(
      /(<main>.*<ol>.*)<li>(\s*<span.*<li class="active">)/s,
      '$1<li class="active">$2'
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

  if (DEV) {
    eleventyConfig.on('afterBuild', async () => {
      await Promise.all([
        // Symlink site/css -> _dev/css. We do this in dev mode instead of
        // addPassthroughCopy() so that changes are reflected immediately,
        // instead of triggering an Eleventy build.
        symlinkForce(
          path.join(__dirname, 'site', 'css'),
          path.join(__dirname, '_dev', 'css')
        ),
        // Symlink lib -> _dev/lib. This lets us directly reference tsc outputs
        // in dev mode, instead of the Rollup bundles we use for production.
        symlinkForce(
          path.join(__dirname, 'lib'),
          path.join(__dirname, '_dev', 'lib')
        ),
      ]);
    });
  }

  return {
    dir: {input: 'site', output: DEV ? '_dev' : '_site'},
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
