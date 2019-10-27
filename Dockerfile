ARG NODE_RELEASE
FROM node:${NODE_RELEASE}-alpine

ARG NODE_RELEASE

LABEL maintainer="Jonathan Sharpe"

COPY /package.json .
COPY /package-lock.json .

RUN npm ci --only=prod

COPY /lib /lib

ENV PORT=80
EXPOSE 80

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
