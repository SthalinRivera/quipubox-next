# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Variables para el build (se inyectan aquí para que Next.js las use al compilar)
ENV NEXT_PUBLIC_SUPABASE_URL="https://hqjaasnzamltvoujrstm.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_nw3Nzzeuz4Kz1xKpD4EwKw_BvsFFPLy"
ENV NEXT_PUBLIC_API_BASE_URL="https://quipubox-api.vercel.app"

RUN npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app ./

# Generar el archivo .env para el runtime (estas variables ya están en el build, pero las copiamos)
RUN echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" > .env && \
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY" >> .env && \
    echo "NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL" >> .env

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# 👇 MODIFICACIÓN: agregar la IP al hosts en el momento de arrancar (no en el build)
CMD sh -c 'echo "64.29.17.3 quipubox-api.vercel.app" >> /etc/hosts && npm run start -- -H 0.0.0.0 -p 3000'