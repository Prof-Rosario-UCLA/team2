FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install
COPY . .
RUN npm run build
EXPOSE 1919
CMD ["npm", "run", "server"] 