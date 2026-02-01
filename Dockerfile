FROM node:14-bullseye-slim

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
