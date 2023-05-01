# `lit-dev-api`

This package contains the necessary data for generating API documentation on
Lit.dev.

## Updating API Documentation

1. Locate the configuration file for the relevant package that you want to
   update (e.g., `packages/lit-dev-tools-cjs/src/api-docs/configs/lit-2.ts`).
2. Update the `commit` field with the desired commit hash.
3. Run the following command: `npm run build --workspace lit-dev-api`.

Upon completion, the updated data will be reflected in the `pages.json` and
`symbols.json` files.

## Archived Documentation

The following directories contain archived documentation and are no longer
automatically updated by the process above:

- `lit-html-1`
- `lit-element-1`

Both directories include static `pages.json` and `symbols.json` files. To update
the archived documentation locally, check out a version of Lit.dev prior to
[Pull Request #1087](https://github.com/lit/lit.dev/pull/1087), and follow the
steps listed above.
