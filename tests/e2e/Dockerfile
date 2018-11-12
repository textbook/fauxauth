FROM node:dubnium-alpine
WORKDIR /e2e

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY .babelrc .
COPY /tests/e2e ./tests
COPY jest.config.e2e.json .

ENTRYPOINT [ "npm" ]
