FROM node:18-alpine3.18
RUN mkdir /app
COPY package*.json /app
WORKDIR /app
COPY . .
RUN npm install
# RUN npx prisma db push
# RUN npx prisma generate
EXPOSE 3000 
CMD ["npm", "start"]
