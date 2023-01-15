ARG ALPINE_RELEASE
ARG NODE_RELEASE

FROM node:${NODE_RELEASE}-alpine${ALPINE_RELEASE} as build

USER node
WORKDIR /home/node
RUN mkdir -p ./packages/fauxauth/

COPY ./package*.json ./
COPY ./packages/fauxauth/package.json ./packages/fauxauth/
RUN npm --workspace packages/fauxauth ci

COPY ./LICENSE ./
COPY ./README.md ./
COPY ./packages/fauxauth/tsconfig.json ./packages/fauxauth/
COPY ./packages/fauxauth/tsconfig.build.json ./packages/fauxauth/
COPY ./packages/fauxauth/src/ ./packages/fauxauth/src/
RUN npm run build

FROM node:${NODE_RELEASE}-alpine${ALPINE_RELEASE} as run

RUN apk add --no-cache tini

USER node
WORKDIR /home/node
RUN mkdir -p ./packages/fauxauth/

COPY --from=build /home/node/package*.json ./
COPY --from=build /home/node/packages/fauxauth/package.json ./packages/fauxauth/
RUN npm --workspace packages/fauxauth ci --omit dev

COPY --from=build /home/node/packages/fauxauth/lib/ ./packages/fauxauth/lib/
COPY ./packages/fauxauth/views/ ./packages/fauxauth/views/

ENV PORT=80
EXPOSE 80
USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "node", "packages/fauxauth/lib/server.js" ]
