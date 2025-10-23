FROM node:22.12.0-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --verbose

# Copy the rest of the application
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start the development server
# Use --host to allow external connections
CMD ["npm", "run", "start:dev"]
