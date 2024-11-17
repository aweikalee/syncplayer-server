FROM node:14-alpine

WORKDIR /app
COPY package.json .
RUN npm config set registry http://mirrors.cloud.tencent.com/npm/
RUN npm install

CMD node index.js

COPY . .

# 声明
EXPOSE 4000