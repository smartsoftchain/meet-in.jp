FROM php:5.6.35-fpm-alpine3.4

RUN deluser www-data \
	&& addgroup -g 1000 -S www-data \
	&& adduser -u 1000 -D -S -G www-data www-data

RUN { \
		echo "listen.owner = nginx"; \
		echo "listen.group = nginx"; \
	} > /usr/local/etc/php-fpm.d/php-fpm.conf \
	&& { \
		echo "[global]"; \
		echo "[www]"; \
		echo "user = www-data"; \
		echo "group = www-data"; \
		echo "listen = 127.0.0.1:9000"; \
		echo "pm = dynamic"; \
		echo "pm.max_children = 10"; \
		echo "pm.start_servers = 4"; \
		echo "pm.min_spare_servers = 1"; \
		echo "pm.max_spare_servers = 4"; \
		echo "pm.max_requests = 500"; \
	}  > /usr/local/etc/php-fpm.d/www.conf \
	&& { \
		echo "include_path = \".:/usr/local/lib/php:/usr/local/lib/php/lib\""; \
	} > /usr/local/etc/php/php.ini

# Zendのライブラリ
COPY lib /usr/local/lib/php/lib

# Go言語のための準備
# ENV GOPATH /go
# RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

# 依存の解決
RUN apk add --update \
	# 証明局関連
	ca-certificates \
	# Go言語
	go \
	# goget などで使う
	git \
	openssh \
	# mysqlクライアントCLI
	mysql-client \
	# mcrypt extentionのために入れる
	libmcrypt-dev \
	# zip extentionのために入れる
	zlib-dev \
	# intl extentionのために入れる
	icu-dev \
	# ビルドのため
	g++ autoconf make \
	# soap extensionのために入れる
	libxml2-dev \
	# PHP extensionのインストール
		&& docker-php-ext-install pdo_mysql \
		&& docker-php-ext-install mcrypt \
		&& docker-php-ext-install mbstring \
		&& docker-php-ext-install intl \
		&& docker-php-ext-install zip \
		&& docker-php-ext-install bcmath \
		&& docker-php-ext-install soap

WORKDIR /var/www/html/public

# /var/www/html → PHPのルート
# /var/www/tmp → tmpディレクトリ
RUN mkdir -p -m +w /var/www/tmp/uploadcsv/ \
	&& mkdir -p -m +w /var/www/tmp/gojson/ \
	&& mkdir -p -m +w /go/bin/validator.v2/cmd/ \
	&& mkdir -p -m +w /var/www/tmp/masterdb \
	&& mkdir -p -m +w /var/www/tmp/clientdb \
	&& mkdir -p -m +w /var/www/tmp/forbidden_approach \
	&& mkdir -p -m +w /var/www/tmp/migration \
	&& mkdir -p -m +w /var/www/tmp/gojson \
	&& mkdir -p -m +w /var/www/tmp/nexway/mailing/permanent/ \
	&& mkdir -p -m +w /var/www/tmp/nexway/mailing/destination/ \
	&& mkdir -p -m +w /var/www/tmp/nexway/fax/permanent/ \
	&& mkdir -p -m +w /var/www/tmp/nexway/fax/destination/ \
	&& mkdir -p -m +w /mnt/messagedata


# Goのビルドのための依存ライブラリ
# RUN go get -v golang.org/x/text/unicode/norm \
# 																github.com/satori/go.uuid \
# 																golang.org/x/net/context

# Goのソースをコピー
# COPY gosrc/dupchecker /go/src/dupchecker
# COPY gosrc/validator.v2 /go/src/validator.v2

# ビルド
# RUN go install dupchecker && \
# 	cd /go/src/validator.v2/cmd && \
# 	go build -o /go/bin/validator.v2/cmd/cmd ./main.go

# ファイルアップロード上限を本番環境と同じ3GBにする
RUN touch /usr/local/etc/php/conf.d/uploads.ini \
    && echo "upload_max_filesize = 3072M;" >> /usr/local/etc/php/conf.d/uploads.ini

CMD ["php-fpm", "--allow-to-run-as-root"]

EXPOSE 3000 9000 9001
