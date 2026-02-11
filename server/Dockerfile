FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

RUN npm run build

CMD ["npm","run","start"]
