import {build, analyzeMetafile} from 'esbuild';
import {minifyHTMLLiteralsPlugin} from 'esbuild-plugin-minify-html-literals';

const commonOptions = {
  bundle: true,
  minify: false,
  format: 'esm',
  treeShaking: true,
  sourcemap: true,
  incremental: true,
  target: 'es2020',
  legalComments: 'eof',
  metafile: true,
  write: true,
};

const client = await build({
  entryPoints: [
    'src/global/lit-hydrate-support.ts',
    'src/components/copy-button.ts',
    'src/components/litdev-aside.ts',
    'src/components/litdev-banner.ts',
    'src/components/litdev-drawer.ts',
    'src/components/litdev-example.ts',
    'src/components/ts-js.ts',
    'src/components/litdev-switchable-sample.ts',
    'src/components/litdev-tutorial.ts',
    'src/components/playground-elements.ts',
    'src/components/resize-bar.ts',
    'src/components/litdev-playground-page.ts',
    'src/github/github-signin-receiver-page.ts',
    'src/global/hydrate-common-components.ts',
    'src/pages/docs.ts',
    'src/pages/home.ts',
    'src/pages/home-components.ts',
    'src/pages/playground-inline.ts',
    'src/global/dsd-polyfill.ts',
  ],
  outdir: 'esbuildout',
  ...commonOptions,
  plugins: [minifyHTMLLiteralsPlugin()],
}).catch(() => process.exit(1));

const server = await build({
  entryPoints: ['src/components/ssr.ts'],
  outdir: 'esbuildout/server',
  ...commonOptions,
  plugins: [minifyHTMLLiteralsPlugin()],
});

const inlined = await build({
  entryPoints: [
    'src/global/apply-mods.ts',
    'src/global/initialize-typescript-attribute.ts',
    'src/global/mobile-drawer.ts',
  ],
  outdir: 'esbuildout/global',
  ...commonOptions,
  plugins: [minifyHTMLLiteralsPlugin()],
});

const analyses = await Promise.all(
  [client, server, inlined].map((result) =>
    analyzeMetafile(result.metafile, {verbose: false})
  )
);

analyses.forEach((analysis) => {
  const analysisLines = analysis.split('\n');
  const formattedAnalysis = analysisLines
    .filter((line) => {
      const isDependency =
        line.includes('├') || line.includes('└') || line.includes('LEGAL.txt');

      if (isDependency) {
        return false;
      }

      const isEmptyLine = line.replace(' ', '').length === 0;

      return !isEmptyLine;
    })
    .join('\n');
  console.log(formattedAnalysis, '\n');
});
process.exit(0);
