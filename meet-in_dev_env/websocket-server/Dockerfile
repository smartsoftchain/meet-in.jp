FROM node:10-alpine

EXPOSE 3000

RUN npm i -S log4js && \
  npm i -S rimraf && \
  npm i -S websocket && \
  npm i -S nodemailer && \
  npm i -S async && \
  npm i -S bluebird

CMD node websocket-server.js
