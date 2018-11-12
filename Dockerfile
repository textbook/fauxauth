FROM node:dubnium-alpine

LABEL maintainer="Jonathan Sharpe"

COPY /package.json .
COPY /package-lock.json .

RUN npm install --only=prod

COPY /lib /lib

EXPOSE 3000

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
