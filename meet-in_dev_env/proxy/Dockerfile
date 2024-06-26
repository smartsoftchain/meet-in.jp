FROM nginx:1.11.4-alpine

ARG WS_CONTAINER=webphone_ws:3000
ARG CHAT_CONTAINER=chat:3001

COPY proxy /
COPY conf.d/ /etc/nginx/conf.d/
COPY certs/ /etc/nginx/certs/

RUN sed -i "s|{{WS_CONTAINER}}|$WS_CONTAINER|;" \
  /etc/nginx/conf.d/default.conf && \
  sed -i "s|{{CHAT_CONTAINER}}|$CHAT_CONTAINER|;" \
  /etc/nginx/conf.d/default.conf && cat /etc/nginx/conf.d/default.conf

# ENTRYPOINT "/proxy"
CMD nginx -g 'daemon off;'
