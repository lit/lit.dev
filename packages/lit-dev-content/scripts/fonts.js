import rimraf from 'rimraf'
import {mkdir, copyFile} from 'fs/promises'
import {execSync} from 'child_process'
import glob from 'globby'
import {parse} from 'path'

rimraf.sync('temp')

try {
  await mkdir('site/fonts/manrope')
} catch {
  // already exists
}

// clone the fonts repo
// TODO: check if the folder already exists
execSync('git clone https://github.com/sharanda/manrope.git temp/manrope')
execSync('cd temp/manrope && git checkout 9ffbc349f4659065b62f780fe6e9d5a93518bd95')
// get the desired font files to copy
const files = await glob('temp/manrope/fonts/web/*.woff2')
// copy the files to site/fonts/manrope
const promises = []
for (const file of files) {
  const parsed = parse(file)
  promises.push(copyFile(file, `site/fonts/manrope/${parsed.name}${parsed.ext}`))
}
await Promise.all(promises)