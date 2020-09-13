import { createRequire } from 'module';
import * as path from 'path';
import * as http from 'http';
import serve from 'serve-handler';

const require = createRequire(import.meta.url);
const contentPackage = require.resolve('lit-dev-content');
const contentDir = path.dirname(contentPackage);

console.log('contentPackage', contentPackage);
console.log('contentDir', contentDir);

const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  serve(req, res, {
    public: contentDir,
    directoryListing: false,
  });
});
server.listen(port);
console.log(`server listening on port ${port}`);
