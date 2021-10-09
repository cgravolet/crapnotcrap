FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV CNC_ENV=docker
CMD ["bin/www"]