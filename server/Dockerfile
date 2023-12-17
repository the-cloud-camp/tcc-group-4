FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
# RUN npx prisma db push
# RUN npx prisma generate
EXPOSE 3000 
CMD ["npm", "start"]
