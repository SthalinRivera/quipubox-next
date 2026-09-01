'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ReporteJabas from '@/components/reportes/ReporteJabas';

export default function ReportesJabasPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Reportes de Jabas" />
      <div className="space-y-6">
        <ReporteJabas />
      </div>
    </div>
  );
}
