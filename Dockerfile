FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm run dist
COPY . .
RUN npm install
RUN npm run build
EXPOSE 1919
CMD ["node", "api.js"]