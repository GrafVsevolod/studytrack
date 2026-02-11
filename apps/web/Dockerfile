# --------- STAGE 1: build Vite app ----------
FROM node:20-alpine AS builder

WORKDIR /app

# копируем package файлы
COPY package*.json ./

# ставим зависимости
RUN npm ci

# копируем весь исходный код фронта
COPY . .

# собираем продакшн-билд
RUN npm run build

# --------- STAGE 2: serve via nginx ----------
FROM nginx:alpine

# удаляем стандартную конфигурацию nginx
RUN rm -rf /usr/share/nginx/html/*

# копируем собранный фронт из предыдущего шага
COPY --from=builder /app/dist /usr/share/nginx/html

# копируем кастомный конфиг nginx (мы добавим его дальше)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
