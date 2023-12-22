FROM node:18-alpine3.18 as build-app

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . ./

RUN npm run build


FROM nginx:alpine
COPY --from=build-app /app/dist /usr/share/nginx/html/group-4/client

EXPOSE 80