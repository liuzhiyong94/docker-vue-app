# 镜像来源
FROM nginx
# 作者 MAINTAINER已经被弃用
# MAINTAINER 刘志勇 
# 删除nginx 默认配置
RUN rm /etc/nginx/conf.d/default.conf
# 添加自己的配置 default.conf 在下面
ADD ../nginx/conf/default.conf /etc/nginx/conf.d/
# npm run build
ENTRYPOINT [ "npm", "build" ]
# 复制打包后的文件到nginx的默认静态页面路径下
COPY ../nginx/www/  /usr/share/nginx/html/
# 绑定数据卷
VOLUME ["../nginx/log","/var/log/nginx"]
VOLUME ["../nginx/www","/usr/share/nginx/html"]
# 暴露端口
EXPOSE 80 443