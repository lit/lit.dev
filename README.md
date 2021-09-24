# lit.dev

New site, new repo.

## Packages

This is a Lerna monorepo.

- lit-dev-content: Main content of lit.dev
- lit-dev-server: Production web server for lit.dev
- lit-dev-tools: Eleventy plugins and other internal tools

## Developing

### Install dependencies

```sh
npm i && npm run bootstrap
```

### Build all

```sh
npm run build
```

### Develop site content

```sh
npm run dev
```

Serves at [`http://localhost:5415`](http://localhost:5415).

You may also prefer to run each dev script in its own terminal:

```sh
cd packages/lit-dev-content

npm run build:ts:watch       # TypeScript
npm run dev:build:site:watch # Eleventy
npm run dev:serve            # @web/dev-server
```

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
`main` branch, but is pinned to a particular commit via the `lit.sha` file. To
update the current commit, run:

```sh
cd packages/lit-dev-tools
npm run monorepo:update
```

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
npm run build:site:watch   # Eleventy
```

Serves at [`http://localhost:6415`](http://localhost:6415)

### Start production Docker environment locally

```sh
docker build -t litdev . --build-arg PLAYGROUND_SANDBOX=http://localhost:7416/
docker run --rm --name litdev -p 7415:7415 -e PORT=7415 -e MODE=main litdev
docker run --rm --name litdev-playground -p 7416:7416 -e PORT=7416 -e MODE=playground litdev
```

Serves at [`http://localhost:7415`](http://localhost:7415)

### Updating screenshots tests

Screenshots that are committed to the repository need to be created through the
"Artifacts / Download link for updated screenshots" Github Action. This action
generates a zip archive `golden-results` which can be extracted into `tests/`.

```sh
unzip golden-results.zip -d tests/
```
