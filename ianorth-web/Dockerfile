FROM node:18-alpine as builder
WORKDIR /app

COPY ./ianorth-web/package.json ./ianorth-web/package-lock.json ./
RUN npm install

# Copia o resto do código-fonte do frontend
COPY ./ianorth-web/ /app

# Roda o script de build 'npm run build'
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
