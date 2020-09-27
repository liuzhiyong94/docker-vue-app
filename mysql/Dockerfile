# 镜像来源
FROM mysql:5.7

COPY /conf/my.cnf  /etc/my.cnf
# COPY /init/init.sql /docker-entrypoint-initdb.d
# 绑定数据卷
# VOLUME ["/db","/var/lib/mysql"]
COPY /init  /tmp/sql
RUN mv /tmp/sql/*.sql /docker-entrypoint-initdb.d
RUN rm -rf /tmp/sql
# 暴露端口
EXPOSE 3306