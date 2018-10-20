FROM node:alpine as build

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY .babelrc .
COPY /src ./src

RUN npm run build

FROM node:alpine

COPY /package.json .
COPY /package-lock.json .

RUN npm install --only=prod

COPY --from=build /lib /lib

CMD npm start
