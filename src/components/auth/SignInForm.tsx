'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeftIcon } from '@/icons';

export default function SignInForm() {
  const { loginWithGoogle, loading } = useAuth();
  const searchParams = useSearchParams();
  const toast = useToast();
  const processedErrorRef = useRef<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error && processedErrorRef.current !== error) {
      processedErrorRef.current = error;
      toast.error(decodeURIComponent(error));

      const supabase = createClient();
      if (supabase) {
        supabase.auth.signOut().catch(console.error);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="flex w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Columna izquierda - Branding (solo escritorio) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 dark:from-brand-700 dark:to-brand-900 p-8 flex-col justify-between relative overflow-hidden">
          {/* Patrón de fondo decorativo */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
              <circle cx="400" cy="400" r="300" fill="white" fillOpacity="0.2" />
              <circle cx="600" cy="200" r="150" fill="white" fillOpacity="0.1" />
              <circle cx="200" cy="600" r="200" fill="white" fillOpacity="0.15" />
            </svg>
          </div>

          <div className="relative z-10">
            {/* Logo con imagen */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm p-1.5">
                <Image
                  src="/images/logo/logo-icon.svg"
                  alt="QuipoBox"
                  width={32}
                  height={32}
                  className="brightness-0 invert"
                />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                QuipuBox
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Gestión inteligente<br />de tu negocio
              </h2>
              <p className="text-white/80 text-lg">
                Controla clientes, frutas, operaciones y más en un solo lugar.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-12">
            <p className="text-white/60 text-sm">
              © 2026 QuipuBox. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col">
          {/* Logo móvil - visible solo en pantallas pequeñas */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                <Image
                  src="/images/logo/logo-icon.svg"
                  alt="QuipoBox"
                  width={28}
                  height={28}
                  className="dark:brightness-0 dark:invert"
                />
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                QuipuBox
              </span>
            </div>
          </div>

          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Volver al inicio
            </Link>
          </div>

          <div className="flex flex-col justify-center flex-1">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90 sm:text-3xl">
                Bienvenido
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Inicia sesión con tu cuenta de Google para continuar
              </p>
            </div>

            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                  fill="#4285F4"
                />
                <path
                  d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                  fill="#34A853"
                />
                <path
                  d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                  fill="#FBBC05"
                />
                <path
                  d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                  fill="#EB4335"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {loading ? "Cargando..." : "Continuar con Google"}
              </span>
            </button>

            <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
              Al iniciar sesión, aceptas nuestros{" "}
              <Link href="/terms" className="underline hover:text-brand-500">
                Términos
              </Link>{" "}
              y{" "}
              <Link href="/privacy" className="underline hover:text-brand-500">
                Política de privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}