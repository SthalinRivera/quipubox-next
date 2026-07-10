// components/camiones/CamionesTable.tsx
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
import { CamionModal } from '@/components/camiones/CamionModal';
import { useCamiones } from '@/hooks/useCamiones';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, PlusIcon, SearchIcon } from '@/icons';
import { Power, Play } from 'lucide-react';
import type { Camion } from '@/types/camion';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function CamionesTable() {
    const { camiones, loading, fetchAll, toggleEstado } = useCamiones();
    const toast = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCamion, setSelectedCamion] = useState<Camion | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ camion: Camion; nuevoEstado: boolean } | null>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const filteredCamiones = camiones.filter(c =>
        c.placa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCamion(null);
        setIsModalOpen(true);
    };

    const handleEdit = (camion: Camion) => {
        setSelectedCamion(camion);
        setIsModalOpen(true);
    };

    const handleToggle = (camion: Camion) => {
        const nuevoEstado = !camion.estado;
        setPendingAction({ camion, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { camion, nuevoEstado } = pendingAction;
        await toggleEstado(camion.id_camion, nuevoEstado);
        toast.success(`Camión ${nuevoEstado ? 'activado' : 'desactivado'}`);
        setConfirmOpen(false);
        setPendingAction(null);
    };

    const handleSaved = () => {
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
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <Button
                    size="sm"
                    onClick={handleCreate}
                    startIcon={<PlusIcon className="h-4 w-4" />}
                >
                    Nuevo Camión
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[700px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Placa</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Descripción</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filteredCamiones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay camiones registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCamiones.map((camion) => (
                                        <TableRow key={camion.id_camion}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{camion.id_camion}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 font-medium">{camion.placa}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{camion.descripcion || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={camion.estado ? 'success' : 'error'}>
                                                    {camion.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(camion)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(camion)}
                                                        className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={camion.estado ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {camion.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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

            <CamionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingCamion={selectedCamion}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? 'Activar camión' : 'Desactivar camión'}
                message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} el camión con placa "${pendingAction?.camion.placa}"?`}
                confirmText={pendingAction?.nuevoEstado ? 'Activar' : 'Desactivar'}
                variant={pendingAction?.nuevoEstado ? 'info' : 'danger'}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}