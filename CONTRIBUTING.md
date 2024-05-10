# Contributing to Lit

Thank you for your interest in contributing to Lit!

There are many ways to contribute to the Lit project, and we have many different needs to be addressed. All contributions, from PRs to reports of successful usage, are appreciated and valuable.

## Code of Conduct

We have a [Code of Conduct](https://github.com/lit/lit/blob/main/CODE_OF_CONDUCT.md), please follow it in all interactions with project maintainers and fellow users.

## Set up

```bash
git clone https://github.com/lit/lit.dev.git
cd lit.dev
npm ci
npm run dev
```

## Tests

### Run the suite of tests

1. `npm test`

Note, all screenshot tests will fail locally. This is because the goldens are generated specifically from the linux instance run by GitHub Actions. To update the goldens you must:

- Wait for GitHub Actions to run the tests
- Click on the failing test action
- Click on the "summary" button on the left panel
- Download the new goldens from the "Artifacts" section
- Update the goldens locally
- Upload your PR with the new goldens

## Tutorial Contributions

See the Tutorial Contributing guide at [packages/lit-dev-content/samples/tutorials/CONTRIBUTING.md](./packages/lit-dev-content/samples/tutorials/CONTRIBUTING.md)

## Filing Issues

Issues are one of the most important ways to contribute to Lit.

Please search though open and closed issues to see if a similar issue already exists. If not, open an issue and try to provide a minimal reproduction if you can.

Occasionally we'll close issues if they appear stale or are too vague - please don't take this personally! Please feel free to re-open issues we've closed if there's something we've missed and they still need to be addressed.

## Pull Requests

Pull requests are greatly appreciated!

Every documentation page on [lit.dev](https://lit.dev) should have an "Edit this page" link at the bottom. That will automatically take you to the GitHub UI to edit that page and submit a Pull Request. This is a great way to contribute to the documentation.

## Code Style

We follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html), but there are a couple of points worth emphasizing:

1.  Clear is better than clever. Optimize for simple, readable code first.
2.  Prefer longer, more descriptive names, over shorter names. For most variables, minification means we don't pay for extra characters in production.
3.  Always err on the side of too many comments. When commenting, "why" is more important than "what".
4.  If you're tempted to add a "what" comment, see if you can't restructure the code and use more descriptive names so that the comment is unnecessary.

## TypeScript

We use TypeScript on Lit in order to automatically check the code for type errors and document the types of fields and attributes for easier reading. If you don't know TypeScript, we hope it doesn't discourage you from contributing - TypeScript is a superset of JavaScript that focuses on adding type annotations.

TypeScript is hopefully relatively easy to pick up, but if you have any problems we're more than happy to help. You can submit a pull request with type warnings and we'll either help you fix them, or if you allow commits to your PR branch, fix them for you. VS Code is a very nice IDE for TypeScript development if you care to try it.

## Algolia Search

The search on lit.dev is powered by Algolia. The [`.github/workflows/build-and-publish-search-index.yml`](./.github/workflows/build-and-publish-search-index.yml) GitHub Actions workflow is responsible for building the the search index and publishing it to Algolia completely replacing our previous search index on each push to the `main` branch. The workflow build crawls the allowlisted parts of the site, cuts it up into chunks based on header `<h1><h2>...` tags, gets its content as its description, and sends it to Algolia. There is also some manual crwaling and chunking done for sections such as the tutorials.

### How To add a custom link to the search index

Sometimes we want to include something that is not on lit.dev in the search index. We can do this by modifying the `packages/lit-dev-content/site/_data/externalSearchData.json` file. This file is a JSON array of objects with the following shape:

```json
{
  "relativeUrl": "https://url-to-the-page.com",
  "title": "Search Item group title (the text above a group of search results)",
  "heading": "Search Item Option Heading Line (defaults to the title of the page if this is empty string but must be defined)",
  "text": "A description of the search item's context. Algolia uses this as well to ",
  "docType": {
    "type": "Colored Tag", // keep this short this is the gray tag to the right of the group title
    "tag": "other" // keep this "other". This determines the color and other defaults to gray
  },
  "isExternal": true // whether or not this is a link external to lit.dev and should have the external link icon
}
```

### How to administer the Algolia search index

To administer the search index to add, remove, delete, enable Algolia features, etc., you must be a part of the Algolia team which has limited space and is currently limited to the Lit team. Contact Elliott on the Lit team if you need access. We do not use Algolia Analytics as we have not had the time to go through Google's privacy review + privacy policy / cookie process for storing user data in Algolia.

### How the Crawler Works

The search indexer plugin is located in [`packages/lit-dev-tools-cjs/src/search/plugin.ts`](./packages/lit-dev-tools-cjs/src/search/plugin.ts). It uses a common indexer API which under the hood uses JSDOM to extract metadata and [creates chunks using `PageSearchChunker`](./packages/lit-dev-tools-cjs/src/search/indexers/PageSearchChunker.ts) from the given pages based on header tags and the text content following each header tag. Each of these chunks is then formatted into a [`UserFacingPageData`](./packages/lit-dev-tools-cjs/src/search/plugin.ts#L40) object ready to be written out into a giant JSON file which is consumed by Algolia.

## Contributor License Agreement

You might notice our friendly CLA-bot commenting on a pull request you open if you haven't yet signed our CLA. We use the same CLA for all open-source Google projects, so you only have to sign it once. Once you complete the CLA, all your pull-requests will automatically get the `cla: yes` tag.

If you've already signed a CLA but are still getting bothered by the awfully insistent CLA bot, it's possible we don't have your GitHub username or you're using a different email address. Check the [information on your CLA](https://cla.developers.google.com/clas) or see this help article on [setting the email on your git commits](https://help.github.com/articles/setting-your-email-in-git/).

[Complete the CLA](https://cla.developers.google.com/clas)
