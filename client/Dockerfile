FROM node:18-alpine3.18 AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.24.0-alpine
COPY --from=builder /app/dist .
WORKDIR /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
