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

# Install production dependencies.
# If you add a package-lock.json, speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm i

RUN npm run bootstrap

# Copy local code to the container image.
COPY . ./

RUN npm run build

# Run the web service on container startup.
CMD [ "node", "packages/lit-dev-server/index.js" ]
