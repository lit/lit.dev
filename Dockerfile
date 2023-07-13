# Official lightweight Node.js image
# https://hub.docker.com/_/node
FROM node:18-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  # Dependencies of Playwright Chromium for Playground SSR
  libgtk-3-0 \
  libnss3 \
  libasound2 \
  libdrm2 \
  libgbm1 \
  # Git needed for cloning Lit monorepo for API docs generation
  git \
  # Certificates needed for Git HTTPS
  ca-certificates

# Arbitrary but conventional working directory
WORKDIR /usr/src/app

# Note we isolate work across sub-packages below, organized from least to most
# likely to change, to maximize Docker filesystem layer cache hits. For
# example, organized this way a site content only change will usually only need
# to execute the final Eleventy build step.

# External dependencies
COPY package*.json tsconfig.base.json ./
COPY packages/lit-dev-tools-cjs/package*.json ./packages/lit-dev-tools-cjs/
COPY packages/lit-dev-tools-esm/package*.json ./packages/lit-dev-tools-esm/
COPY packages/lit-dev-server/package*.json ./packages/lit-dev-server/
COPY packages/lit-dev-api/package*.json ./packages/lit-dev-api/
COPY packages/lit-dev-content/package*.json ./packages/lit-dev-content/
RUN npm ci

# Tooling code
COPY packages/lit-dev-tools-cjs/ ./packages/lit-dev-tools-cjs/
COPY packages/lit-dev-tools-esm/ ./packages/lit-dev-tools-esm/
COPY packages/lit-dev-server/ ./packages/lit-dev-server/
RUN npm run build:ts -w packages/lit-dev-tools-cjs -w packages/lit-dev-tools-esm -w packages/lit-dev-server

# Pre-generated API docs data
COPY packages/lit-dev-api/ ./packages/lit-dev-api/

# Site content
COPY packages/lit-dev-content/ ./packages/lit-dev-content/

# Environment variables used by Eleventy build
ARG LITDEV_ENV
ARG REVISION_TAG
ARG SHORT_SHA

# Kaniko doesn't include ARG values in the layer cache key (see
# https://github.com/GoogleContainerTools/kaniko/pull/1085). This is different
# to normal Docker behavior, which would invalidate anything after the ARG
# declaration if the value changes. So, we need to write it to the file system
# to force a cache invalidation. Otherwise, we might re-use the most recent
# Eleventy build output, even when our build environment variables have changed.
RUN echo "LITDEV_ENV=$LITDEV_ENV" >> env \
  && echo "REVISION_TAG=$REVISION_TAG" >> env \
  && echo "SHORT_SHA=$SHORT_SHA" >> env

# Eleventy build
RUN npm run prod:build -w packages/lit-dev-content

# Run the web service on container startup.
#
# IMPORTANT: Keep --max-old-space-size in sync with the --memory flag in
# ./cloudbuild-main.yaml. The flag here should be set a little lower than
# --memory (e.g. 75%) to give headroom for other uses [0].
#
# (Node isn't aware of Docker memory limits, so if we don't set this flag we're
# at higher risk for termination and restart. This value determines when V8
# decides to perform garbage collection. Node uses sysinfo totalram as the
# default limit [1], which will be higher than our Docker memory limit.)
#
# [0] https://nodejs.org/api/cli.html#cli_max_old_space_size_size_in_megabytes
# [1] https://github.com/nodejs/node/pull/25576
CMD [ "node", "--max-old-space-size=768", "packages/lit-dev-server/lib/server.js" ]
