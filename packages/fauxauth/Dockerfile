ARG ALPINE_RELEASE
ARG NODE_RELEASE

FROM node:${NODE_RELEASE}-alpine${ALPINE_RELEASE}

WORKDIR /home/node

LABEL maintainer="Jonathan Sharpe"

COPY ./package*.json ./

ENV NODE_ENV=production
ENV PORT=80

RUN npm ci

COPY ./lib ./lib
COPY ./views ./views

EXPOSE 80
USER node

CMD [ "node", "lib/server.js" ]
