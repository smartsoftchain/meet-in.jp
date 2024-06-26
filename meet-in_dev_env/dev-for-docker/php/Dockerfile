FROM php:5.6.35-apache

COPY php.ini /usr/local/etc/php/

# Zendのライブラリ
COPY lib /usr/local/lib/php/lib

# 依存の解決
RUN apt-get update \
  && apt-get install -y libfreetype6-dev libjpeg62-turbo-dev libpng-dev libmcrypt-dev imagemagick \
  && mv /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled 
# PHP extensionのインストール
RUN docker-php-ext-install pdo_mysql 
RUN docker-php-ext-install mcrypt 
RUN docker-php-ext-install mbstring 
RUN docker-php-ext-install zip 

RUN apt-get update && apt-get install libmagickwand-dev -y --no-install-recommends \
  && pecl install imagick-3.4.3 \
  && docker-php-ext-enable imagick


COPY ./000-default.conf /etc/apache2/sites-available/

WORKDIR /var/www/html/public

# /var/www/html → PHPのルート
# /var/www/tmp → tmpディレクトリ



