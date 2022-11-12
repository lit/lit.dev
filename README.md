# lit.dev

New site, new repo.

## Packages

This is an npm workspaces monorepo.

- lit-dev-content: Main content of lit.dev
- lit-dev-server: Production web server for lit.dev
- lit-dev-tools: Eleventy plugins and other internal tools

## Developing

### Install dependencies

```sh
npm ci
```

### Develop site content

```sh
npm run dev
```

Serves at [`http://localhost:5415`](http://localhost:5415).

Dev mode is different to production in these ways:

- Browser auto-reload.
- CSS is not inlined or minified. CSS changes are reflected immediately.
- JS is not inlined, bundled, bare-module transformed, or minified. JS changes
  are reflected immediately after `tsc` compile.
- HTML is not minified.

If needed, you can check for dev mode from an Eleventy template using the
`env.DEV` global:

```
{% if env.DEV %}
  <p>Dev mode</p>
{% else %}
  <p>Prod mode</p>
{% endif %}
```

### Update generated API docs

First run `npm run dev` as shown above, and then in another terminal:

```sh
cd packages/lit-dev-api
npm run build:watch
```

You can now edit the comments in any `.ts` file in the `lit` directory,
and after the automatic rebuild, the dev site will refresh.

```sh
code packages/lit-dev-api/lit/
```

The `lit` directory is a regular cloned git repo, so you can make changes
directly here, and push PRs from it as normal. It's configured to track the
`main` branch, but is pinned to a particular commit. To update the current
commit, update the `sha` field in
[`packages/lit-dev-tools-cjs/src/api-docs/configs/lit-2.ts`](https://github.com/lit/lit.dev/blob/main/packages/lit-dev-tools-cjs/src/api-docs/configs/lit-2.ts).

### Serve production mode

```sh
npm run build
npm start
```

Serves at [`http://localhost:6415`](http://localhost:6415)

### Watch production mode

```sh
npm start # production server

cd packages/lit-dev-content
npm run build:ts:watch     # TypeScript
npm run build:rollup:watch # Rollup
npm run build:eleventy:watch   # Eleventy
```

Serves at [`http://localhost:6415`](http://localhost:6415)

### Start production Docker environment locally

```sh
docker build -t litdev . --build-arg LITDEV_ENV=local
docker run --rm --name litdev -p 6415:6415 -e LITDEV_ENV=local -e MODE=main litdev
docker run --rm --name litdev-playground -p 6416:6416 -e LITDEV_ENV=local -e MODE=playground litdev
```

Serves at [`http://localhost:6415`](http://localhost:6415)

### Updating screenshots tests

Unless you are using Linux, screenshot test goldens need to be created by
downloading artifacts from the "Integration Tests" Github Action.

If the integration tests fail, two `.zip` archives are generated as artifacts,
which can be downloaded from the "Artifacts" menu in the top-right of the failing action:

- `screenshot-goldens.zip`: New goldens which, if correct, can be extracted into
  `packages/lit-dev-tests/src/playwright` and committed as the new goldens:

  ```sh
  unzip screenshot-goldens.zip -d packages/lit-dev-tests/src/playwright
  ```

- `screenshot-diffs.zip`: Expected, actuals, and diff screenshots. Can be
  extracted and viewed directly to help understand what failed.

### Contributing Tutorials

See the Tutorial Contributing guide at [packages/lit-dev-content/samples/tutorials/CONTRIBUTING.md](./packages/lit-dev-content/samples/tutorials/CONTRIBUTING.md)
