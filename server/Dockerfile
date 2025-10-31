FROM node:22.12.0-alpine
WORKDIR /app

# Create data directory with proper permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

RUN npm install -g nodemon ts-node tsconfig-paths
COPY package*.json ./

RUN npm install --verbose
COPY . .

# Ensure the node user owns the entire app directory
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3000
CMD ["npm", "run" , "start:dev"]
