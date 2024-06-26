FROM php:5.6-fpm-alpine

RUN  docker-php-ext-install mbstring


# VOLUME /var/www/websocket
WORKDIR /var/www/websocket

EXPOSE 3000

CMD  ["php","/var/www/websocket/websocket.php"]
