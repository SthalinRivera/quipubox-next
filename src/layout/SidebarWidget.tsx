import React from "react";
export const dynamic = 'force-dynamic';  // ← Agrega esta línea


export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl 
        bg-white px-4 py-5 text-center 
        border border-gray-200 shadow-sm
        dark:bg-gray-800/60 dark:border-white/[0.05] dark:shadow-none
      `}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Versión
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
        1.1
      </p>
    </div>
  );
}