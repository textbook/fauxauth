ARG NODE_RELEASE

FROM node:${NODE_RELEASE}-alpine

ARG NODE_RELEASE

WORKDIR /home/node

LABEL maintainer="Jonathan Sharpe"

COPY ./package*.json ./

ENV NODE_ENV=production
ENV PORT=80

RUN npm ci

COPY ./lib ./lib
COPY ./views ./views

EXPOSE 80

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
