'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import JabasPorPagarTable from '@/components/jabas/JabasPorPagarTable';
import { usePermissions } from '@/hooks/usePermissions';

export default function JabasPorPagarPage() {
    const { hasRole } = usePermissions();

    const isAdmin = hasRole(['administrador', 'admin']);
    const isEncargadoRetorno = hasRole('encargado_retorno');
    const isSupervisor = hasRole('supervisor');
    const isEmisor = hasRole('emisor');
    const isRepartidor = hasRole(['repartidor', 'encargado_carga']);

    const canView = isAdmin || isEncargadoRetorno || isSupervisor || isEmisor || isRepartidor;
    const canRegisterDevolucion = isAdmin || isEncargadoRetorno || isSupervisor || isEmisor || isRepartidor;
    const canAnularCompletar = isAdmin;

    if (!canView) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tiene permisos para ver este módulo
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Jabas por Pagar (Emisor)" />
            <div className="space-y-6">
                <ComponentCard title="Jabas por devolver al emisor">
                    <JabasPorPagarTable
                        isReadOnly={!canRegisterDevolucion}
                        canAnularCompletar={canAnularCompletar}
                    />
                </ComponentCard>
            </div>
        </div>
    );
}
