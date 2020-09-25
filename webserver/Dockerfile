FROM node:12.18.4

ADD . /home/webserver

WORKDIR /home/webserver

RUN npm install 

EXPOSE 3100

CMD ["npm", "start"]