FROM node:dubnium-alpine

WORKDIR /e2e

COPY /package.json .
COPY /package-lock.json .

RUN npm ci

COPY /tests ./tests

ENTRYPOINT [ "npm" ]
