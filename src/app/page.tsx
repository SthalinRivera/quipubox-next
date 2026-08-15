import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuiPuBox — Gestión Logística y Distribución de Frutas | SaaS",
  description:
    "Plataforma SaaS para gestión logística, distribución y comercialización de frutas. Controla clientes, cargas, entregas, jabas, camiones y reportes en un solo lugar.",
  keywords: [
    "distribución de frutas",
    "logística de frutas",
    "gestión de jabas",
    "SaaS logística",
    "control de entregas",
    "plataforma de distribución",
  ],
  openGraph: {
    title: "QuiPuBox — Gestión Logística y Distribución de Frutas",
    description:
      "La plataforma SaaS que centraliza clientes, sedes, frutas, camiones, cargas, entregas, jabas y reportes en un solo lugar.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
