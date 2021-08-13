ARG ALPINE_RELEASE
ARG NODE_RELEASE

FROM node:${NODE_RELEASE}-alpine${ALPINE_RELEASE}

WORKDIR /home/node

LABEL maintainer="Jonathan Sharpe"

COPY ./package*.json ./

ENV NODE_ENV=production
RUN npm ci

COPY ./lib ./lib
COPY ./views ./views

ENV PORT=80
EXPOSE $PORT

USER node

CMD [ "node", "/home/node/lib/server.js" ]
