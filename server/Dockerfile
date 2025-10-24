FROM node:22.12.0-alpine
WORKDIR /app
RUN npm install -g nodemon ts-node tsconfig-paths
COPY package*.json ./

RUN npm install --verbose
COPY . .
EXPOSE 3000
CMD ["npm", "run" , "start:dev"]
