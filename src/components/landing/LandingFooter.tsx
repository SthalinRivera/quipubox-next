"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const productLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Planes", href: "#planes" },
  { label: "Cómo funciona", href: "#como-funciona" },
];

const companyLinks = [
  { label: "Sobre nosotros", href: "#" },

];

const supportLinks = [
  { label: "Centro de ayuda", href: "#" },


];

export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/logo/logo.svg"
                alt="QuiPuBox"
                width={150}
                height={40}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/images/logo/logo-dark.svg"
                alt="QuiPuBox"
                width={150}
                height={40}
                className="hidden h-8 w-auto dark:block"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              La plataforma SaaS para gestionar el transporte y distribución de
              frutas. Sistema web y app móvil para empresas comercializadoras,
              distribuidoras y transportistas.
            </p>

            {/* Contacto con iconos en turquesa */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:hola@quipubox.com"
                className="group flex items-center gap-3 text-sm text-gray-500 transition hover:text-[#17BEC0] dark:text-gray-400 dark:hover:text-[#17BEC0]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#17BEC0]/10 text-[#17BEC0] transition group-hover:bg-[#17BEC0] group-hover:text-white">
                  <Mail className="h-4 w-4" />
                </span>
                Soporte@quipubox.com
              </a>
              <a
                href="tel:+51999999999"
                className="group flex items-center gap-3 text-sm text-gray-500 transition hover:text-[#17BEC0] dark:text-gray-400 dark:hover:text-[#17BEC0]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#17BEC0]/10 text-[#17BEC0] transition group-hover:bg-[#17BEC0] group-hover:text-white">
                  <Phone className="h-4 w-4" />
                </span>
                +51 698 532 415
              </a>
              <div className="group flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#17BEC0]/10 text-[#17BEC0]">
                  <MapPin className="h-4 w-4" />
                </span>
                Imperial, Cañete, Lima, Perú
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Producto
            </h4>
            {/* Línea decorativa turquesa */}
            <div className="mt-2 h-0.5 w-8 rounded-full bg-[#17BEC0]" />
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 transition hover:text-[#17BEC0] dark:text-gray-400 dark:hover:text-[#17BEC0]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Empresa
            </h4>
            <div className="mt-2 h-0.5 w-8 rounded-full bg-[#17BEC0]" />
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 transition hover:text-[#17BEC0] dark:text-gray-400 dark:hover:text-[#17BEC0]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Soporte
            </h4>
            <div className="mt-2 h-0.5 w-8 rounded-full bg-[#17BEC0]" />
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 transition hover:text-[#17BEC0] dark:text-gray-400 dark:hover:text-[#17BEC0]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>


          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 py-6 sm:flex-row dark:border-white/10">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} QuiPuBox. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-400 transition hover:text-[#17BEC0] dark:hover:text-[#17BEC0]">
              Política de privacidad
            </a>
            <a href="#" className="text-xs text-gray-400 transition hover:text-[#17BEC0] dark:hover:text-[#17BEC0]">
              Términos de uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}