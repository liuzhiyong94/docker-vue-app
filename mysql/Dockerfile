# 镜像来源
FROM mysql:5.7

COPY /conf/my.cnf  /etc/my.cnf
COPY /init/init.sql /docker-entrypoint-initdb.d
# 绑定数据卷
VOLUME ["/db","/var/lib/mysql"]
# 暴露端口
EXPOSE 3306