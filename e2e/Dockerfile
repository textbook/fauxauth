ARG NODE_RELEASE
FROM node:${NODE_RELEASE:-dubnium}-alpine

ARG NODE_RELEASE

WORKDIR /e2e

COPY /package.json .
COPY /package-lock.json .

RUN if [ ${NODE_RELEASE:-dubnium} = "boron" ]; \
  then npm install --only=prod; \
  else npm ci --only=prod; \
  fi

COPY /tests ./tests

ENTRYPOINT [ "npm" ]
