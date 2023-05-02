# `lit-dev-api`

Contains necessary data for generating Lit.dev API docs.

## Update Generated API Documentation

1. Update the `commit` field with the desired commit hash, within
   `packages/lit-dev-tools-cjs/src/api-docs/configs/lit-2.ts`.
1. Execute `npm run build --workspace lit-dev-api`.

Updated API documentation will be reflected in the `pages.json` and
`symbols.json` files.

## Archived Documentation

`lit-html-1` and `lit-element-2` contain archived documentation and are no
longer automatically updated. To update the archived documentation locally,
check out a version of Lit.dev prior to [Pull Request
#1087](https://github.com/lit/lit.dev/pull/1087), and follow the steps listed
above.

## How to update Lit.dev API page templates

For `lit-html-1` and `lit-element-2`, the data from `pages.json` and
`symbols.json` are used with the `api-v1.html` template to generate the
resulting HTML. Otherwise modify `api.html` for `lit-2`.

Hint: Use `{{ node | dump }}` to debug the structure of the object in
the template.