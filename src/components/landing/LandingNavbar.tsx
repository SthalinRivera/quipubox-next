"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const navLinks = [
  { label: "Beneficios", href: "#beneficios" },
  { label: "Planes", href: "#planes" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#faq" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo/logo.svg"
              alt="QuipuBox"
              width={150}
              height={40}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/images/logo/logo-dark.svg"
              alt="QuipuBox"
              width={150}
              height={40}
              className="hidden h-8 w-auto dark:block"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Iniciar sesión
            </Link>
            {/* Botón principal cambiado a turquesa */}
            {/* <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-lg bg-[#17BEC0] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#13a3a5]"
            >
              Solicitar demo
            </a> */}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950 lg:hidden">
          <div className="space-y-1 px-4 pb-4 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-3 dark:border-white/10">
              <Link
                href="/signin"
                className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Iniciar sesión
              </Link>
              {/* Botón móvil cambiado a turquesa */}
              <a
                href="#contacto"
                className="rounded-lg bg-[#17BEC0] px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#13a3a5]"
              >
                Solicitar demo
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}