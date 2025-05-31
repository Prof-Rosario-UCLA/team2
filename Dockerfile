FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm run dist
COPY . .
RUN npm install

RUN npm run build

EXPOSE 1919
EXPOSE 5173


CMD ["npm", "run", "dev:full"]