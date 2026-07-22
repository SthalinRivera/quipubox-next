'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { name: 'Categorías', path: '/dashboard/configuracion/categorias' },
    { name: 'Módulos', path: '/dashboard/configuracion/modulos' },
    { name: 'Permisos de roles', path: '/dashboard/configuracion/permisos' },
];

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Configuración del sistema
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gestiona categorías, módulos y permisos de roles
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-6">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path;
                        return (
                            <Link
                                key={tab.path}
                                href={tab.path}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                    isActive
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {children}
        </div>
    );
}
