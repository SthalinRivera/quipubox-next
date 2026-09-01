'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ReporteClientesPuestos from '@/components/reportes/ReporteClientesPuestos';

export default function ReportesClientesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Clientes y Puestos" />
      <div className="space-y-6">
        <ReporteClientesPuestos />
      </div>
    </div>
  );
}
