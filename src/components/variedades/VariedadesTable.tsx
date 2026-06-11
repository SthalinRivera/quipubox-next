// components/variedades/VariedadesTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { VariedadModal } from '@/components/variedades/VariedadModal';
import { useVariedades } from '@/hooks/useVariedades';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, PlusIcon } from '@/icons';

import { Power, Play } from 'lucide-react';
import type { Variedad } from '@/types/variedad';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function VariedadesTable() {
    const { variedades, loading, fetchAll, toggleEstado } = useVariedades();
    const toast = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariedad, setSelectedVariedad] = useState<Variedad | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ variedad: Variedad; nuevoEstado: boolean } | null>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleCreate = () => {
        setSelectedVariedad(null);
        setIsModalOpen(true);
    };

    const handleEdit = (variedad: Variedad) => {
        setSelectedVariedad(variedad);
        setIsModalOpen(true);
    };

    const handleToggle = (variedad: Variedad) => {
        const nuevoEstado = !variedad.estado;
        setPendingAction({ variedad, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { variedad, nuevoEstado } = pendingAction;
        await toggleEstado(variedad.id_variedad, nuevoEstado);
        toast.success(`Variedad ${nuevoEstado ? 'activada' : 'desactivada'}`);
        setConfirmOpen(false);
        setPendingAction(null);
    };

    const handleSaved = () => {
        // Solo cierra el modal (el estado local ya se actualizó en el hook)
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                <TableSkeleton columns={7} rows={5} showActionButton={true} />;
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="h-4 w-4" />}>
                    Nueva Variedad
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Fruta</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {variedades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay variedades registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    variedades.map((variedad) => (
                                        <TableRow key={variedad.id_variedad}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{variedad.id_variedad}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{variedad.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {variedad.frutas?.nombre || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={variedad.estado ? 'success' : 'error'}>
                                                    {variedad.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(variedad)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(variedad)}
                                                        className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={variedad.estado ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {variedad.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <VariedadModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingVariedad={selectedVariedad}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? 'Activar variedad' : 'Desactivar variedad'}
                message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} la variedad "${pendingAction?.variedad.nombre}"?`}
                confirmText={pendingAction?.nuevoEstado ? 'Activar' : 'Desactivar'}
                variant={pendingAction?.nuevoEstado ? 'info' : 'danger'}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}