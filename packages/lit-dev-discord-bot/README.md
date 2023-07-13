# lit-dev-discord-bot

This package contains the code for Lit Bot discord bot that responds to `/docs` command which searches the lit.dev site index for provided query and returns a list of matches. It posts the url to the doc in the chat when an option is selected.

## Deployment

The bot is deployed by Google Cloud Build as a Cloud Run service. The Cloud Build configuration is stored in the root of the monorepo `cloudbuild-discord-bot.yaml`.

The Cloud Build job must be triggered _manually_ to deploy a new version of the bot. Run the trigger from the Google Cloud console after the new code is merged to deploy a new version of the bot. After successful deployment, remove the old revision to prevent multiple bots from trying to handle the same request.
