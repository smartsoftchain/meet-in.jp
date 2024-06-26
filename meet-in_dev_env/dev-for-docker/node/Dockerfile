FROM node:13
 
# application dir
WORKDIR /var/www/html_meet/websocket-server

RUN npm install -g forever
RUN npm install rimraf
RUN npm install socket.io
RUN npm install log4js
RUN npm install mysql2
RUN npm install websocket

EXPOSE 4567
CMD [ "forever", "websocket-server.js" ]