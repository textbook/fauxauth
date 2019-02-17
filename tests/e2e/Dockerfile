FROM node:dubnium-alpine
WORKDIR /e2e

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY /tests/e2e ./tests
COPY jest.config.js .
COPY jest.config.e2e.js .
COPY tsconfig.json .

ENTRYPOINT [ "npm" ]
