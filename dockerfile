FROM node:8-alpine

COPY yarn.lock /server/yarn.lock
COPY package.json /server/package.json
WORKDIR /server

RUN apk --update add --no-cache python make g++
RUN if [ "x$NODE_ENV" == "xproduction" ]; then yarn install --production ; else yarn install ; fi

COPY . .

EXPOSE 3003