# 📖 CMPC Libros Frontend

Frontend del proyecto **CMPC Libros**, una aplicación moderna desarrollada con **React + TypeScript + Vite + TailwindCSS**, que se integra con el backend NestJS para la gestión de libros, autores, géneros y editoriales.

---

## 🚀 Tecnologías Principales

- ⚛️ **React 18** — Librería principal para la construcción de interfaces.
- 🧠 **TypeScript** — Tipado estático para mayor robustez.
- ⚡ **Vite** — Herramienta de desarrollo rápida y optimizada.
- 🎨 **TailwindCSS** — Framework de estilos utilitario para diseño moderno y responsivo.
- 🧩 **React Router DOM** — Manejo de rutas en SPA.
- 🔄 **Axios** — Cliente HTTP para la comunicación con el backend.
- 🧱 **Ant Design / RSuite** — (opcional) Componentes de UI profesionales.
- 📦 **PNPM** — Gestor de paquetes recomendado.

---

## 🛠️ Instalación

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/tuusuario/cmpc-libros-frontend.git
cd cmpc-libros-frontend
```

### 2️⃣ Instalar dependencias

Se recomienda usar **pnpm** (por velocidad y consistencia), aunque también puedes usar npm o yarn.

```bash
pnpm install
# o
npm install
# o
yarn install
```

### 3️⃣ Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```bash
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=CMPC Libros
VITE_ENABLE_DEBUG=true
```

> Asegúrate de que `VITE_API_URL` apunte al backend NestJS donde se ejecuta el API.

---

## 🧩 Scripts Disponibles

| Comando | Descripción |
|----------|--------------|
| `pnpm dev` | Inicia el servidor de desarrollo en modo hot-reload |
| `pnpm build` | Genera la build optimizada para producción |
| `pnpm preview` | Sirve localmente la build de producción |
| `pnpm lint` | Ejecuta el analizador de código estático |
| `pnpm format` | Formatea el código con Prettier |

---

## 🌐 Estructura del Proyecto

```bash
src/
 ├── assets/              # Imágenes, íconos y recursos estáticos
 ├── components/          # Componentes reutilizables (botones, formularios, etc.)
 ├── pages/               # Páginas principales (Autores, Géneros, Libros...)
 ├── services/            # Servicios y conexión con el backend (axios)
 ├── hooks/               # Hooks personalizados
 ├── styles/              # Archivos Tailwind y estilos globales
 ├── routes/              # Definición de rutas de React Router
 ├── types/               # Interfaces y tipos TypeScript
 ├── main.tsx             # Punto de entrada principal
 ├── App.tsx              # Componente raíz
 └── vite-env.d.ts        # Tipado global para Vite
```

---

## 💅 Estilos y Diseño

El diseño está basado en **TailwindCSS**, con una paleta definida (naranja + negro).  
Puedes personalizarla en `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#ff6b00',
      secondary: '#000000',
    },
  },
}
```

Se recomienda mantener un diseño limpio, con animaciones suaves y consistencia entre vistas.

---

## 🔐 Integración con Backend (NestJS + Swagger)

El frontend consume la API REST documentada en **Swagger** del backend CMPC Libros.  
Por defecto, el backend se encuentra en:  
👉 `http://localhost:3000`  
y la documentación en:  
👉 `http://localhost:3000/api`

Ejemplo de llamada al backend desde Axios:

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getAuthors = async () => {
  const response = await api.get('/authors');
  return response.data;
};
```

---

## 🔄 Despliegue con Docker

A continuación encontrarás instrucciones para construir y servir el frontend usando **Docker**. Recomiendo usar **Nginx** para servir los archivos estáticos generados por Vite.

### 🔸 Dockerfile (producción)

Crea un archivo `Dockerfile` en la raíz del proyecto con el siguiente contenido:

```dockerfile
# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
# si usas pnpm
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build

# Production stage (nginx)
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 🔸 Configuración de Nginx

Crea `nginx/default.conf` para manejar SPA routing (rewrite all to index.html):

```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Opcional: gzip para mejorar performance
  gzip on;
  gzip_types text/plain application/javascript text/css application/json;
}
```

### 🔸 docker-compose (opcional)

Si quieres levantar frontend junto al backend (ej. `cmpc-backend`) con docker-compose:

```yaml
version: '3.8'
services:
  backend:
    image: tu_usuario/cmpc-backend:latest
    build:
      context: ../cmpc-libros-backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}

  frontend:
    build: .
    image: tu_usuario/cmpc-frontend:latest
    ports:
      - "8080:80"
    environment:
      - VITE_API_URL=http://backend:3000
    depends_on:
      - backend
```

> En este `docker-compose` el frontend se sirve en el puerto `8080` y apunta al `backend` por nombre de servicio (`http://backend:3000`). Ajusta `context` y rutas según tu estructura de repositorios (si backend está en otro repo, puedes usar la imagen ya construida).

### 🔸 Construir y ejecutar

Construir la imagen:

```bash
docker build -t tu_usuario/cmpc-frontend:latest .
```

Correr el contenedor:

```bash
docker run -d -p 8080:80 --name cmpc-frontend tu_usuario/cmpc-frontend:latest
```

O con `docker-compose`:

```bash
docker-compose up --build -d
```

---

## 🧪 Pruebas E2E (opcional)
Puedes usar **Vitest** o **Cypress**:

```bash
pnpm install -D vitest jsdom @testing-library/react
pnpm test
```

Ejemplo:
```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page', () => {
  render(<App />);
  expect(screen.getByText(/CMPC Libros/i)).toBeInTheDocument();
});
```

---

## 🧱 Mejores prácticas aplicadas
- Estructura **modular y escalable**
- Tipado estricto con **TypeScript**
- Estilos unificados con **TailwindCSS**
- Consistencia visual con **Ant Design**
- Documentación de componentes con comentarios JSDoc
- Seguridad con **JWT + interceptores Axios**
- Configuración lista para **Docker** y despliegue en contenedores

---

## 🧑‍💻 Autor

Desarrollado por **Patricio Morales**  
🚀 Full Stack Developer | NestJS + React + TypeScript + Firebase

📧 Contacto: [morales.patricio1993@gmail.com](mailto:morales.patricio1993@gmail.com)
🌐 Portafolio: [https://tusitio.dev](https://tusitio.dev)
