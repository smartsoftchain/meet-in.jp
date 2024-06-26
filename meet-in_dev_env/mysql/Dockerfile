FROM mysql:5.6

ENV MYSQL_DATABASE tel-marketing_tmo
ENV MYSQL_ROOT_PASSWORD root

COPY init.d/ /docker-entrypoint-initdb.d/
RUN chown mysql:mysql /var/log/mysql
RUN chmod 700 /var/log/mysql

COPY myconf /etc/mysql/conf.d
RUN chmod 644 /etc/mysql/conf.d/my.cnf
