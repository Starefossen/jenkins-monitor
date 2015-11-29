FROM node:slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --only prod
COPY . /usr/src/app

CMD [ "node", "index.js" ]
