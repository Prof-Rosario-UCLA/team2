FROM node:18-alpine
WORKDIR /app
COPY package*.json ./


RUN rm -rf package-lock.json node_modules
RUN npm cache clean --force
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "preview"]