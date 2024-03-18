const rimraf = require('rimraf')
const {mkdirSync, copyFileSync} = require('fs')
const {execFileSync, execSync} = require('child_process')
const glob = require('globby')
const {parse} = require('path')



rimraf.sync('temp')

try {
  mkdirSync('site/fonts/manrope')
} catch {
  // already exists
}

// clone the fonts repo
// TODO: check if the folder already exists
execFileSync('git', ['clone', 'https://github.com/sharanda/manrope.git', 'temp/manrope'])
execSync('cd temp/manrope && git checkout 9ffbc349f4659065b62f780fe6e9d5a93518bd95')
// get the desired font files to copy
const files = glob.sync('temp/manrope/fonts/web/*.woff2')
// copy the files to site/fonts/manrope
for (const file of files) {
  const parsed = parse(file)
  copyFileSync(file, `site/fonts/manrope/${parsed.name}${parsed.ext}`)
}