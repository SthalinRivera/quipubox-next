'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ReporteUsuarios from '@/components/reportes/ReporteUsuarios';

export default function ReportesUsuariosPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Usuarios y Roles" />
      <div className="space-y-6">
        <ReporteUsuarios />
      </div>
    </div>
  );
}
