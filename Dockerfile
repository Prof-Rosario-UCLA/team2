FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm run dist
COPY . .
RUN rm -rf node_modules package-lock.json
RUN npm install

RUN npm run build

EXPOSE 5173


CMD ["npm", "run", "dev:full"]