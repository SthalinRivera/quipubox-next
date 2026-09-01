'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ReporteOperativo from '@/components/reportes/ReporteOperativo';

export default function ReportesOperativosPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Reportes Operativos" />
      <div className="space-y-6">
        <ReporteOperativo />
      </div>
    </div>
  );
}
