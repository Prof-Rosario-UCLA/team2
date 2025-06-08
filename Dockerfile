FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags to handle optional dependencies
RUN npm install --no-optional

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 1919

# Start the server
CMD ["node", "api.js"]