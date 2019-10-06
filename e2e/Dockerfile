ARG NODE_RELEASE
FROM node:${NODE_RELEASE:-dubnium}-alpine

ARG NODE_RELEASE

WORKDIR /e2e

COPY /package.json .
COPY /package-lock.json .

RUN npm ci || npm install

COPY /tests ./tests

ENTRYPOINT [ "npm" ]
