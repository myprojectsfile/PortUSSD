FROM node:alpine
# RUN mkdir app
WORKDIR /app
COPY package*.json ./
RUN npm install
# COPY ./node_modules /app/
# COPY ./server.js /app/
# COPY ./ussd.controller.js /app/
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]