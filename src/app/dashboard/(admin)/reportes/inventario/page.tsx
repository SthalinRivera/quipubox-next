'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ReporteInventario from '@/components/reportes/ReporteInventario';

export default function ReportesInventarioPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Inventario y Productos" />
      <div className="space-y-6">
        <ReporteInventario />
      </div>
    </div>
  );
}
