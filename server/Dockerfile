FROM node:18-alpine3.18
RUN mkdir /app
COPY package*.json /app
WORKDIR /app
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 8000 
CMD ["npm", "start"]
