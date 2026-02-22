FROM node:22-alpine

WORKDIR /code

COPY package.json package-lock.json* ./
RUN npm install
COPY . .