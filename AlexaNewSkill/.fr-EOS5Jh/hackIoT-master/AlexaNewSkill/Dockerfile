FROM node:slim

RUN npm install -g nodemon@1.14.7

RUN npm install bespoken-tools -g

COPY package.json /skill/package.json

WORKDIR /skill/
RUN npm install
WORKDIR /skill/dist/app/

EXPOSE 8000
EXPOSE 27017

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

