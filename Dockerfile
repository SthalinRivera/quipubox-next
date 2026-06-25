# 1. Imagen base
FROM node:20-alpine AS base

WORKDIR /app

# 2. Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# 3. Copiar código
COPY . .

# 4. Variables de entorno en build
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# 5. Build Next.js
RUN npm run build

# 6. Runtime image (más liviana)
FROM node:20-alpine

WORKDIR /app

COPY --from=base /app ./

EXPOSE 3000

CMD ["npm", "start"]