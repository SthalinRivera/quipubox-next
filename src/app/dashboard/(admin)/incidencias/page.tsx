'use client';

import { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import IncidenciasTable from '@/components/incidencias/IncidenciasTable';
import IncidenciaModal from '@/components/incidencias/IncidenciasModal';
import Button from '@/components/ui/button/Button';
import { PlusIcon } from 'lucide-react';

export default function IncidenciasPage() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div>
            <PageBreadcrumb pageTitle="Incidencias" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        startIcon={<PlusIcon className="h-4 w-4" />}
                        onClick={() => setModalOpen(true)}
                    >
                        Nueva incidencia
                    </Button>
                </div>
                <ComponentCard title="Listado de Incidencias">
                    <IncidenciasTable />
                </ComponentCard>
            </div>

            <IncidenciaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => setModalOpen(false)}
                incidencia={null}
            />
        </div>
    );
}
