ARG NODE_RELEASE
FROM node:${NODE_RELEASE:-dubnium}-alpine

ARG NODE_RELEASE

LABEL maintainer="Jonathan Sharpe"

COPY /package.json .
COPY /package-lock.json .

RUN if [ ${NODE_RELEASE:-dubnium} = "boron" ]; \
  then npm install --only=prod; \
  else npm ci --only=prod; \
  fi

COPY /lib /lib

ENV PORT=80
EXPOSE 80

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
