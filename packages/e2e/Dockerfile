ARG ALPINE_RELEASE
ARG NODE_RELEASE

FROM node:${NODE_RELEASE}-alpine${ALPINE_RELEASE}

USER node
WORKDIR /home/node
RUN mkdir -p packages/e2e/

COPY ./package*.json ./
COPY ./packages/e2e/package.json ./packages/e2e/
RUN npm --workspace packages/e2e ci

COPY ./packages/e2e/jest.config.js ./packages/e2e/
COPY ./packages/e2e/tests/ ./packages/e2e/tests/

ENTRYPOINT [ "npm", "--workspace=packages/e2e", "test" ]
