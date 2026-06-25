# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# No necesitamos ARG porque las rutas son dinámicas (force-dynamic)

RUN npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# ⭐ SOLUCIÓN DEFINITIVA: agregar la IP al hosts y arrancar
CMD sh -c 'echo "64.29.17.3 quipubox-api.vercel.app" >> /etc/hosts && npm run start -- -H 0.0.0.0 -p 3000'