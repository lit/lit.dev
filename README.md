# lit.dev

New site, new repo.

This is a Lerna monorepo

* Install dependencies:

  ```sh
  npm i && npm run bootstrap
  ```
* Build all:

  ```sh
  npm run build
  ```

* Start server

  ```sh
  npm start
  ```

* Build site content:

  ```sh
  cd packages/lit-dev-content
  npm run build:site
  # or, to watch:
  npm run build:site:watch
  ```

  _Note, we could probably hook up es-dev-server to auto-refresh the page too_

* Build Cloud Run Docker image:

  ```sh
  gcloud builds submit --tag gcr.io/{project}/{service}
  ```

* Deploy Cloud Run service

  ```sh
  gcloud run deploy --image gcr.io/{project}/{service} --platform managed
  ```
