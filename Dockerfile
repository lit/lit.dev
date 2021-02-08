# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:14-slim

# Dependencies of Playwright Chromium.
RUN apt-get update && apt-get install -y --no-install-recommends \
  libgtk-3-0 \
  libnss3 \
  libasound2

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json lerna.json ./
COPY packages/lit-dev-content/package*.json ./packages/lit-dev-content/
COPY packages/lit-dev-server/package*.json ./packages/lit-dev-server/
COPY packages/lit-dev-tools/package*.json ./packages/lit-dev-tools/

# Install production dependencies.
# If you add a package-lock.json, speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm i

RUN npm run bootstrap

# Copy local code to the container image.
COPY . ./

RUN npm run build

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
CMD [ "node", "--max-old-space-size=768", "packages/lit-dev-server/index.js" ]
