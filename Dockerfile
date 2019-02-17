ARG NODE_VERSION
FROM node:${NODE_VERSION:-dubnium}-alpine

LABEL maintainer="Jonathan Sharpe"

COPY /package.json .
COPY /package-lock.json .

RUN npm ci --only=prod

COPY /lib /lib

ENV PORT=80
EXPOSE 80

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
