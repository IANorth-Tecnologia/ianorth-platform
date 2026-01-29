FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# Copia todo o resto do código-fonte
COPY . .

# Constrói a aplicação para produção
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
