// components/frutas/FrutasTable.tsx
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
import { FrutaModal } from '@/components/frutas/FrutaModal';
import { useFrutas } from '@/hooks/useFrutas';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, PlusIcon } from '@/icons';
import { Power, Play } from 'lucide-react';
import type { Fruta } from '@/types/fruta';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function FrutasTable() {
    const { frutas, loading, fetchAll, toggleEstado } = useFrutas();
    const toast = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFruta, setSelectedFruta] = useState<Fruta | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ fruta: Fruta; nuevoEstado: boolean } | null>(null);

    // Carga inicial
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleCreate = () => {
        setSelectedFruta(null);
        setIsModalOpen(true);
    };

    const handleEdit = (fruta: Fruta) => {
        setSelectedFruta(fruta);
        setIsModalOpen(true);
    };

    const handleToggle = (fruta: Fruta) => {
        const nuevoEstado = !fruta.estado;
        setPendingAction({ fruta, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { fruta, nuevoEstado } = pendingAction;
        await toggleEstado(fruta.id_fruta, nuevoEstado);
        toast.success(`Fruta ${nuevoEstado ? 'activada' : 'desactivada'}`);
        setConfirmOpen(false);
        setPendingAction(null);
    };

    const handleSaved = () => {
        // Solo cierra el modal, no recarga la tabla (el estado local ya se actualizó en el hook)
        setIsModalOpen(false);
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-700 dark:text-gray-300">
            <TableSkeleton columns={7} rows={5} showActionButton={true} />;
        </div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" onClick={handleCreate} startIcon={<PlusIcon className="h-4 w-4" />}>
                    Nueva Fruta
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[600px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Descripción</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {frutas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay frutas registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    frutas.map((fruta) => (
                                        <TableRow key={fruta.id_fruta}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{fruta.id_fruta}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{fruta.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{fruta.descripcion || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={fruta.estado ? 'success' : 'error'}>
                                                    {fruta.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(fruta)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(fruta)}
                                                        className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={fruta.estado ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {fruta.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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

            <FrutaModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingFruta={selectedFruta}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? 'Activar fruta' : 'Desactivar fruta'}
                message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} la fruta "${pendingAction?.fruta.nombre}"?`}
                confirmText={pendingAction?.nuevoEstado ? 'Activar' : 'Desactivar'}
                variant={pendingAction?.nuevoEstado ? 'info' : 'danger'}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}