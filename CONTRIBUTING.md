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

## Contributor License Agreement

You might notice our friendly CLA-bot commenting on a pull request you open if you haven't yet signed our CLA. We use the same CLA for all open-source Google projects, so you only have to sign it once. Once you complete the CLA, all your pull-requests will automatically get the `cla: yes` tag.

If you've already signed a CLA but are still getting bothered by the awfully insistent CLA bot, it's possible we don't have your GitHub username or you're using a different email address. Check the [information on your CLA](https://cla.developers.google.com/clas) or see this help article on [setting the email on your git commits](https://help.github.com/articles/setting-your-email-in-git/).

[Complete the CLA](https://cla.developers.google.com/clas)
