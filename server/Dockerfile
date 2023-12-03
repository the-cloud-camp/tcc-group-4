FROM node:21-alpine
WORKDIR /app
COPY . .
RUN rm -rf node_modules
RUN rm -rf package-lock.json
RUN npm install
RUN npx prisma generate
EXPOSE 3000 
CMD ["npm", "start"]

