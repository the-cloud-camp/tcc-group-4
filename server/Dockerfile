FROM node:18-alpine3.18
RUN mkdir /app
COPY package*.json /app
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
EXPOSE 8000 
CMD ["npm", "start"]
