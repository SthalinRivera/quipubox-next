"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DashboardSkeleton } from "@/components/common/DashboardSkeleton";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth(); // <-- Iniciar la restauración de sesión desde el layout para evitar el deadlock
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isLoading: authLoading, isLoggingOut } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar el skeleton mientras carga el estado de autenticación y roles, o durante la hidratación del cliente
  if (!mounted || authLoading) {
    return <DashboardSkeleton />;
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex relative">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>

      {/* Capa premium difuminada al cerrar sesión */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-gray-950 shadow-theme-xl border border-gray-200 dark:border-gray-800 text-center max-w-[90%] w-[360px]">
            {/* Spinner premium */}
            <div className="h-10 w-10 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                Cerrando sesión
              </h3>
              <p className="text-sm text-gray-400">
                Limpiando tu sesión de forma segura...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

