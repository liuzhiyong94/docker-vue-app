FROM node:12.18.4

ADD . /home/authserver

WORKDIR /home/authserver

RUN npm install 

EXPOSE 3000

CMD ["npm", "start"]