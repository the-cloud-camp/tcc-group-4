FROM node:18-alpine3.18
RUN mkdir /app
COPY package*.json /app
WORKDIR /app
RUN npm install
COPY . .
EXPOSE 3003
CMD ["npm", "run", "dev"]
