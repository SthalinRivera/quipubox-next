import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuipuBox — Gestión Logística, Transporte y Distribución de Frutas | SaaS",
  description:
    "Sistema SaaS para gestionar el transporte y distribución de frutas. Controla cargas, guías, entregas, jabas, camiones, incidencias y reportes. Web + App móvil.",
  keywords: [
    "gestión logística de frutas",
    "transporte de frutas",
    "distribución de frutas",
    "control de cargas",
    "guías de transporte",
    "gestión de jabas",
    "SaaS logística",
    "app móvil repartidores",
    "control de entregas",
    "trazabilidad de cargas",
  ],
  openGraph: {
    title: "QuipuBox — Gestión Logística, Transporte y Distribución de Frutas",
    description:
      "La plataforma para gestionar el transporte y distribución de frutas. Sistema web y app móvil para empresas comercializadoras, distribuidoras y transportistas.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
