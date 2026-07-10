'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/tabs/Tabs';
import JabasPorPagarTable from './JabasPorPagarTable';
import JabasPorCobrarTable from './JabasPorCobrarTable';
import { RecuperacionModal } from './RecuperacionModal';
import { usePermissions } from '@/hooks/usePermissions';
import type { JabaPorCobrar } from '@/types/jaba';

export default function JabasTabs() {
    const [activeTab, setActiveTab] = useState('pagar');
    const [recuperacionModalOpen, setRecuperacionModalOpen] = useState(false);
    const [selectedJabaCobrar, setSelectedJabaCobrar] = useState<JabaPorCobrar | null>(null);
    const { roles, hasRole } = usePermissions();

    const isAdmin = hasRole(['administrador', 'admin']);
    const isEncargadoRetorno = hasRole('encargado_retorno');
    const isSupervisor = hasRole('supervisor');
    const isEmisor = hasRole('emisor');
    const isReceptor = hasRole('receptor');
    const isRepartidor = hasRole(['repartidor', 'encargado_carga']);
    const isChofer = hasRole(['chofer', 'estibador']);

    // Acciones permitidas según rol
    const canRegisterDevolucion = isAdmin || isEncargadoRetorno || isSupervisor || isEmisor || isRepartidor;
    const canRegisterRecuperacion = isAdmin || isEncargadoRetorno || isSupervisor || isReceptor;
    const canAnularCompletar = isAdmin;
    const canViewPagar = isAdmin || isEncargadoRetorno || isSupervisor || isEmisor || isRepartidor;
    const canViewCobrar = isAdmin || isEncargadoRetorno || isSupervisor || isReceptor;

    // Definir tabs según el rol
    const getTabs = () => {
        const availableTabs = [];
        if (canViewPagar) {
            availableTabs.push({ id: 'pagar', label: 'Por Pagar (Emisor)' });
        }
        if (canViewCobrar) {
            availableTabs.push({ id: 'cobrar', label: 'Por Cobrar (Receptor)' });
        }
        return availableTabs;
    };

    const tabs = getTabs();

    // Si no tiene tabs, no mostrar nada
    if (tabs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tiene permisos para ver este módulo
            </div>
        );
    }

    // Si solo hay un tab, no mostrar tabs
    const showTabs = tabs.length > 1;

    const handleOpenRecuperacion = (jaba: JabaPorCobrar) => {
        setSelectedJabaCobrar(jaba);
        setRecuperacionModalOpen(true);
    };

    const handleRecuperacionSuccess = () => {
        setRecuperacionModalOpen(false);
        setSelectedJabaCobrar(null);
    };

    return (
        <div className="space-y-4">
            {showTabs && (
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            )}
            <div className="mt-4">
                {(activeTab === 'pagar' || (!showTabs && canViewPagar)) && (
                    <JabasPorPagarTable
                        isReadOnly={!canRegisterDevolucion}
                        canAnularCompletar={canAnularCompletar}
                    />
                )}
                {(activeTab === 'cobrar' || (!showTabs && canViewCobrar)) && (
                    <JabasPorCobrarTable
                        isReadOnly={!canRegisterRecuperacion}
                        onRegisterRecuperacion={handleOpenRecuperacion}
                    />
                )}
            </div>

            {/* Modal de Recuperación */}
            <RecuperacionModal
                open={recuperacionModalOpen}
                onOpenChange={setRecuperacionModalOpen}
                jaba={selectedJabaCobrar}
                onSuccess={handleRecuperacionSuccess}
            />
        </div>
    );
}
