# 🌐 Sistema de Trazabilidad de Traslado y Retorno de Frutas y Jabas

Plataforma integral para la gestión logística de jabas (contenedores) y frutas, con trazabilidad entre sedes, control de inventario, roles y multiempresa. Desarrollado por **QuipuBox Group SAC**.

---

## 🚀 Características clave

- 📦 Trazabilidad de jabas (préstamos, devoluciones, recuperaciones)
- 🍎 Vinculación de frutas por lote y traslado
- 🏢 Multiempresa, multisede y multirol
- 📊 Dashboards y reportes en tiempo real
- 🔔 Alertas y notificaciones
- 📱 Responsive + modo oscuro

---

## 🛠 Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js (App Router) | Frontend SSR |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos |
| Prisma ORM | Base de datos (PostgreSQL) |
| JWT / NextAuth | Autenticación |
| React Hook Form + Zod | Formularios y validación |

---

## 👥 Equipo

- **Ing. Kelbi Ramírez** – Desarrollador Móvil  
- **Ing. Satlin Rivera** – Desarrollador Web  
- **Ing. Lumeres Paredes** – Diseñador UX/UI  
- **Lic. Sofía Pérez** – Marketing y Comunicaciones  

---

## ⚙️ Instalación rápida

```bash
git clone https://github.com/quipubox/trazabilidad-jabas.git
cd trazabilidad-jabas
npm install
# Configurar .env.local (ver ejemplo)
npx prisma migrate dev
npm run dev