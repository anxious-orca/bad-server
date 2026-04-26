FROM node:22-alpine as build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
