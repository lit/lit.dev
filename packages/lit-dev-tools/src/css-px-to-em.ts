import {glob} from 'glob';
import * as fs from 'fs';

const pattern = `${__dirname}/../../lit-dev-content/site/css/**/*.css`;
const files = glob.sync(pattern);
const baseline = Number(process.argv[2]);
const dry = process.argv[3] === 'dry';
if (isNaN(baseline)) {
  throw new Error('Baseline arg is not a number');
}
for (const path of files) {
  const content = fs.readFileSync(path, 'utf8');
  const transformed = content.replace(/(\d*\.?\d*)\s*px/g, (_, px) => {
    const em = `${Number(px) / baseline}em`;
    if (dry) {
      console.log(`${px}px => ${em}`);
    }
    return em;
  });
  if (!dry && content !== transformed) {
    fs.writeFileSync(path, transformed, 'utf8');
  }
}
