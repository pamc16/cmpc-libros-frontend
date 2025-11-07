# Etapa build
FROM node:24-alpine AS builder
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiamos package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalamos dependencias con hoisting para evitar problemas en Alpine
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copiamos todo el código fuente
COPY . .

# Construimos el proyecto
RUN pnpm build

# Etapa de producción con Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
