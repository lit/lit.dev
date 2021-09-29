/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// This script downloads the fonts used by lit.dev from Google Fonts so that
// they can be hosted locally. We do this because:
//
// 1. There's no caching advantage to using an external CDN for fonts because of
//    https://developers.goole.com/web/updates/2020/10/http-cache-partitioning.
//
// 2. It avoids an extra connection and allows fonts to be multiplexed over the
//    same HTTP/2 connection as other assets.
//
// 3. We can make our own smaller version of the @font-face rules. E.g. we know
//    that we only care about the latin character set (for now). We can also
//    then inline these into our HTML, so that fonts start downloading as soon
//    as possible.
//
// 4. It allows a simpler CSP policy.
//
// 5. It's one less thing that can go down. Google Fonts probably has great
//    uptime, but you can't beat having no external service dependency at all.

import fetch from 'node-fetch';
import {fileURLToPath} from 'url';
import * as pathlib from 'path';
import * as fs from 'fs/promises';

interface Font {
  name: string;
  weights: number[];
  latinOnly: boolean;
  license: string;
}

// Licensing info can be found at https://fonts.google.com/attribution
const FONTS: Font[] = [
  {
    name: 'Open Sans',
    weights: [300, 400, 600, 700, 800],
    latinOnly: true,
    license: `
Copyright 2020 The Open Sans Project Authors (https://github.com/googlefonts/opensans)
SPDX-License-Identifier: Apache-2.0`,
  },
  {
    name: 'Roboto Mono',
    weights: [400],
    latinOnly: true,
    license: `
Copyright 2015 The Roboto Mono Project Authors (https://github.com/googlefonts/robotomono)
SPDX-License-Identifier: Apache-2.0`,
  },
  {
    name: 'Manrope',
    weights: [400, 500, 600, 700, 800],
    latinOnly: true,
    license: `
Copyright 2019 The Manrope Project Authors (https://github.com/sharanda/manrope)
SPDX-License-Identifier: OFL-1.1`,
  },
];

const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = pathlib.dirname(THIS_FILE);
const LIT_DEV_SITE_DIR = pathlib.relative(
  process.cwd(),
  pathlib.resolve(THIS_DIR, '..', '..', 'lit-dev-content', 'site')
);
const FONTS_DIR = pathlib.join(LIT_DEV_SITE_DIR, 'fonts');
const FONTS_CSS_DIR = pathlib.join(LIT_DEV_SITE_DIR, 'css', 'fonts');

const CHROME_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36';

const LATIN_UNICODE_RANGE =
  '\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;';

// Clear out the existing font dirs.
console.log(`Deleting files in ${FONTS_DIR} and ${FONTS_CSS_DIR}`);
for (const filename of await fs.readdir(FONTS_DIR)) {
  await fs.unlink(pathlib.join(FONTS_DIR, filename));
}
for (const filename of await fs.readdir(FONTS_CSS_DIR)) {
  await fs.unlink(pathlib.join(FONTS_CSS_DIR, filename));
}

// Generate and write a license file.
const LICENSE_TEXT = FONTS.map(
  (font) => `${font.name}\n${font.license.trim()}`
).join('\n\n');
await fs.writeFile(pathlib.join(FONTS_DIR, 'LICENSE'), LICENSE_TEXT, 'utf8');

for (const font of FONTS) {
  console.log();
  console.log(`Downloading ${font.name} from Google Fonts`);
  // Fetch the font's CSS file from Google Fonts.
  const gfCssUrl = `https://fonts.googleapis.com/css2?family=${
    font.name
  }:wght@${font.weights.join(';')}&display=swap`;
  const gfCssResp = await fetch(gfCssUrl, {
    headers: {
      // We need to use a modern browser's user agent like Chrome, or else
      // Google Fonts won't know that it can serve us a modern font format like
      // woff2. We only support modern browsers on lit.dev, so there's no
      // advantage to legacy fallback.
      'User-Agent': CHROME_USER_AGENT,
    },
  });
  if (!gfCssResp.ok) {
    throw new Error(`Error fetching ${gfCssUrl}: ${gfCssResp.status}`);
  }
  const gfCssText = await gfCssResp.text();

  // Process each @font-face rule in the Google Fonts CSS file.
  const lowerKebabFontName = font.name.toLowerCase().replace(' ', '-');
  const gfFaceRules = gfCssText.matchAll(/@font-face {.+?}/gs);
  const litdevFaceRules = [];
  const fontsToFetch = new Map<string, string>();
  const weightsSet = new Set(font.weights);
  for (const [gfRule] of gfFaceRules) {
    if (font.latinOnly && !gfRule.includes(LATIN_UNICODE_RANGE)) {
      continue;
    }

    // There will be a @font-face rule for each font-weight. We only care about
    // some of them.
    const weightMatch = gfRule.match(/font-weight: (\d+);/);
    if (weightMatch === null) {
      throw new Error(
        `Could not extract weight from @font-face: ${gfRule} from ${gfCssUrl}`
      );
    }
    const weight = Number(weightMatch[1]);
    if (!weightsSet.has(weight)) {
      continue;
    }

    // Extract the fonts.googleapis.com URL. We'll fetch this now, and then
    // replace the url() with a path to our local copy.
    const gfFontUrlMatch = gfRule.match(/src: url\((.+?)\)/);
    if (gfFontUrlMatch === null) {
      throw new Error(
        `Could not extract src from @font-face: ${gfRule} from ${gfCssUrl}`
      );
    }
    const gfFontUrl = gfFontUrlMatch[1];
    const litdevFontPath = pathlib.join(
      FONTS_DIR,
      `${lowerKebabFontName}-${pathlib.basename(gfFontUrl)}`
    );
    fontsToFetch.set(gfFontUrl, litdevFontPath);
    const litdevFontUrlPath =
      '/' + pathlib.relative(LIT_DEV_SITE_DIR, litdevFontPath);
    let litdevRule = gfRule.replace(gfFontUrl, litdevFontUrlPath);
    if (font.latinOnly) {
      // We don't need the unicode-range property in our @font-face rule because
      // we don't have any non-latin characters to distinguish it from.
      litdevRule = litdevRule.replace(LATIN_UNICODE_RANGE, '');
    }
    litdevFaceRules.push(litdevRule);
  }

  if (litdevFaceRules.length == 0) {
    throw new Error(`Did not find any faces for font ${font.name}`);
  }

  // Fetch and write the font file.
  for (const [gfFontUrl, litdevFontPath] of fontsToFetch) {
    const fontResp = await fetch(gfFontUrl);
    if (!fontResp.ok) {
      throw new Error(`Error fetching ${gfFontUrl}: ${fontResp.status}`);
    }
    const fontBytes = await fontResp.buffer();
    await fs.writeFile(litdevFontPath, fontBytes);
    console.log(`Wrote font ${litdevFontPath}`);
  }

  // Write the CSS file.
  const litdevCssText = litdevFaceRules.join('\n\n');
  const litdevCssPath = pathlib.join(
    FONTS_CSS_DIR,
    `${lowerKebabFontName}.css`
  );
  await fs.writeFile(litdevCssPath, litdevCssText, 'utf8');
  console.log(`Wrote CSS ${litdevCssPath}`);
}

console.log();
console.log('Success!');
