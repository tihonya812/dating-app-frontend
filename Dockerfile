# Базовый образ для сборки React-приложения
FROM node:18 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json, затем устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Копируем весь проект и собираем его
COPY . .
RUN npm run build

# Используем легковесный образ для продакшена
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]