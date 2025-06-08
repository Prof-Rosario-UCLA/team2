FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm run dist
COPY . .
RUN rm -rf node_modules package-lock.json
RUN npm install

RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=1919

EXPOSE 1919


CMD ["npm", "run", "dev:full"]