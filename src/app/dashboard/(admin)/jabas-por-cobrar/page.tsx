'use client';

import { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import JabasPorCobrarTable from '@/components/jabas/JabasPorCobrarTable';
import { RecuperacionModal } from '@/components/jabas/RecuperacionModal';
import { usePermissions } from '@/hooks/usePermissions';
import type { JabaPorCobrar } from '@/types/jaba';

export default function JabasPorCobrarPage() {
    const { hasRole } = usePermissions();
    const [recuperacionModalOpen, setRecuperacionModalOpen] = useState(false);
    const [selectedJabaCobrar, setSelectedJabaCobrar] = useState<JabaPorCobrar | null>(null);

    const isAdmin = hasRole(['administrador', 'admin']);
    const isEncargadoRetorno = hasRole('encargado_retorno');
    const isSupervisor = hasRole('supervisor');
    const isReceptor = hasRole('receptor');

    const canView = isAdmin || isEncargadoRetorno || isSupervisor || isReceptor;
    const canRegisterRecuperacion = isAdmin || isEncargadoRetorno || isSupervisor || isReceptor;

    if (!canView) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tiene permisos para ver este módulo
            </div>
        );
    }

    const handleOpenRecuperacion = (jaba: JabaPorCobrar) => {
        setSelectedJabaCobrar(jaba);
        setRecuperacionModalOpen(true);
    };

    const handleRecuperacionSuccess = () => {
        setRecuperacionModalOpen(false);
        setSelectedJabaCobrar(null);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Jabas por Cobrar (Receptor)" />
            <div className="space-y-6">
                <ComponentCard title="Jabas por recuperar del receptor">
                    <JabasPorCobrarTable
                        isReadOnly={!canRegisterRecuperacion}
                        onRegisterRecuperacion={handleOpenRecuperacion}
                    />
                </ComponentCard>
            </div>

            <RecuperacionModal
                open={recuperacionModalOpen}
                onOpenChange={setRecuperacionModalOpen}
                jaba={selectedJabaCobrar}
                onSuccess={handleRecuperacionSuccess}
            />
        </div>
    );
}
