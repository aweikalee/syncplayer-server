FROM node:14-alpine

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

CMD node index.js

COPY . .

# 声明
EXPOSE 4000