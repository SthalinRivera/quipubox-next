'use client';

import { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ReporteOperativo from '@/components/reportes/ReporteOperativo';
import ReporteJabas from '@/components/reportes/ReporteJabas';
import ReporteClientesPuestos from '@/components/reportes/ReporteClientesPuestos';
import ReporteInventario from '@/components/reportes/ReporteInventario';
import ReporteUsuarios from '@/components/reportes/ReporteUsuarios';

const tabs = [
  { id: 'operativos', label: 'Reportes Operativos' },
  { id: 'jabas', label: 'Reportes de Jabas' },
  { id: 'clientes', label: 'Clientes y Puestos' },
  { id: 'inventario', label: 'Inventario y Productos' },
  { id: 'usuarios', label: 'Usuarios y Roles' },
];

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState('operativos');

  return (
    <div>
      <PageBreadcrumb pageTitle="Reportes" />

      <div className="space-y-6">
        {/* Tabs Navigation */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'operativos' && <ReporteOperativo />}
          {activeTab === 'jabas' && <ReporteJabas />}
          {activeTab === 'clientes' && <ReporteClientesPuestos />}
          {activeTab === 'inventario' && <ReporteInventario />}
          {activeTab === 'usuarios' && <ReporteUsuarios />}
        </div>
      </div>
    </div>
  );
}
