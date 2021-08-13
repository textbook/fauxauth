ARG ALPINE_RELEASE
ARG NODE_RELEASE

FROM node:${NODE_RELEASE}-alpine${ALPINE_RELEASE}

WORKDIR /e2e

COPY ./package*.json ./

RUN npm ci

COPY /tests ./tests

ENTRYPOINT [ "npm" ]
