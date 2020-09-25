FROM node:14

ADD . /app/authserver

WORKDIR /app/authserver

RUN npm install 

EXPOSE 3000

CMD ["npm", "start"]