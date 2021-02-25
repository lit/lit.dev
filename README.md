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

Serves at [`http://localhost:8000`](http://localhost:8000) (port may be incremented if not available, see console output).

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

If needed, you can check for dev mode from an Eleventy template using the `dev`
global:

```
{% if dev %}
  <p>Dev mode</p>
{% else %}
  <p>Prod mode</p>
{% endif %}
```

### Serve production mode

```sh
npm run build
npm start
```

### Watch production mode

```sh
npm start # production server

cd packages/lit-dev-content
npm run build:ts:watch     # TypeScript
npm run build:rollup:watch # Rollup
npm run build:site:watch   # Eleventy
```

Serves at [`http://localhost:8080`](http://localhost:8080)

### Start production Docker environment locally

```sh
docker build -t litdev .
docker run --rm --name litdev -p 8080:8080 litdev
```
