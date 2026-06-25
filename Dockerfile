# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# No necesitamos ARG porque las rutas ya son dinámicas (force-dynamic)
# El build no requiere las variables, así que no las definimos aquí.

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

# Crear un script de entrypoint que resuelve el DNS dinámicamente
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Resolver la IP del backend a partir de NEXT_PUBLIC_API_BASE_URL' >> /entrypoint.sh && \
    echo 'if [ -n "$NEXT_PUBLIC_API_BASE_URL" ]; then' >> /entrypoint.sh && \
    echo '  HOST=$(echo "$NEXT_PUBLIC_API_BASE_URL" | sed -e "s|^https\?://||" -e "s|/.*$||")' >> /entrypoint.sh && \
    echo '  IP=$(getent hosts "$HOST" | awk "{ print \$1 }" | head -n1)' >> /entrypoint.sh && \
    echo '  if [ -n "$IP" ]; then' >> /entrypoint.sh && \
    echo '    echo "$IP $HOST" >> /etc/hosts' >> /entrypoint.sh && \
    echo '    echo "[entrypoint] $HOST -> $IP agregado a /etc/hosts"' >> /entrypoint.sh && \
    echo '  else' >> /entrypoint.sh && \
    echo '    echo "[entrypoint] Advertencia: no se pudo resolver $HOST"' >> /entrypoint.sh && \
    echo '  fi' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Ejecutar el comando original (CMD)' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]