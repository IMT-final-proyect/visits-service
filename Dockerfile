FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i -g @nestjs/cli
RUN npm install
COPY . .
EXPOSE 3004
CMD [ "npm", "run", "start" ]