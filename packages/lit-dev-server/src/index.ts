import { createRequire } from 'module';
import * as path from 'path';
import * as http from 'http';

// import Koa from 'koa';
// import Router from '@koa/router';
// import mount from 'koa-mount';
import serve from 'serve-handler';

const require = createRequire(import.meta.url);

console.log('serve', serve);

const contentPackage = require.resolve('lit-dev-content');
console.log('contentPackage', contentPackage);
const contentDir = path.dirname(contentPackage);
console.log('contentDir', contentDir);

// const app = new Koa();
// app.use(async (context, _) => {
//   console.log('A', context.path);
//   await serve(context.req, context.res, {
//     // public: '/Users/justinfagnani/Projects/Lit/2.0/lit.dev/packages/lit-dev-content/',
//     // directoryListing: false,
//   });
//   console.log('B');
//   context.res.end();
// });

// const port = 3000;
// app.listen(port);
// console.log(`server listening on port ${port}`);

const server = http.createServer((req, res) => {
  serve(req, res, {
    public: '/Users/justinfagnani/Projects/Lit/2.0/lit.dev/packages/lit-dev-content/_site',
    directoryListing: false,
  });
});
server.listen(3000);
