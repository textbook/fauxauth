ARG NODE_RELEASE
FROM node:${NODE_RELEASE}-alpine

ARG NODE_RELEASE

WORKDIR /e2e

COPY /package.json .
COPY /package-lock.json .

RUN npm ci

COPY /tests ./tests

ENTRYPOINT [ "npm" ]
