// src/app/dashboard/(admin)/incidencias/page.tsx
'use client';

import { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import IncidenciasTable from '@/components/incidencias/IncidenciasTable';
import IncidenciaModal from '@/components/incidencias/IncidenciasModal';
import { useIncidencias } from '@/hooks/useIncidencias';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/button/Button';
import { PlusIcon } from 'lucide-react';

export default function IncidenciasPage() {
    const { incidencias, loading, fetchAll, remove } = useIncidencias();
    const toast = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIncidencia, setSelectedIncidencia] = useState<any>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleCreate = () => {
        setSelectedIncidencia(null);
        setModalOpen(true);
    };

    const handleEdit = (incidencia: any) => {
        setSelectedIncidencia(incidencia);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta incidencia?')) return;
        try {
            await remove(id);
            toast.success('Incidencia eliminada');
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar');
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedIncidencia(null);
    };

    const handleModalSuccess = () => {
        fetchAll(); // refrescar lista
        handleModalClose();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Incidencias" />
            <div className="space-y-6">
                <ComponentCard
                    title="Listado de Incidencias"

                >


                    <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="h-4 w-4" />}>
                        Nueva incidencia
                    </Button>

                    <IncidenciasTable
                        data={incidencias}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </ComponentCard>
            </div>

            <IncidenciaModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                incidencia={selectedIncidencia}
            />
        </div>
    );
}