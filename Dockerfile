FROM node:alpine as build

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY .babelrc .
COPY /src ./src

RUN npm run babel

FROM node:alpine

LABEL maintainer="Jonathan Sharpe"

COPY /package.json .
COPY /package-lock.json .

RUN npm install --only=prod

COPY --from=build /lib /lib

EXPOSE 3000

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
