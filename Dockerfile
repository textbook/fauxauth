ARG NODE_VERSION='dubnium-alpine'
FROM node:${NODE_VERSION}

LABEL maintainer="Jonathan Sharpe"

COPY /package.json .
COPY /package-lock.json .

RUN npm install --only=prod

COPY /lib /lib

ENV PORT=80
EXPOSE 80

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
