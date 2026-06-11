// components/calidades/CalidadesTable.tsx
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
import { CalidadModal } from '@/components/calidades/CalidadModal';
import { useCalidades } from '@/hooks/useCalidades';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, PlusIcon, SearchIcon } from '@/icons';
import type { Calidad } from '@/types/calidad';
import { Power, Play } from 'lucide-react';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';
export default function CalidadesTable() {
    const { calidades, loading, fetchAll, toggleEstado } = useCalidades();
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCalidad, setSelectedCalidad] = useState<Calidad | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ calidad: Calidad; nuevoEstado: boolean } | null>(null);

    // Carga inicial
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const filteredCalidades = calidades.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCalidad(null);
        setIsModalOpen(true);
    };

    const handleEdit = (calidad: Calidad) => {
        setSelectedCalidad(calidad);
        setIsModalOpen(true);
    };

    const handleToggle = (calidad: Calidad) => {
        const nuevoEstado = !calidad.estado;
        setPendingAction({ calidad, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { calidad, nuevoEstado } = pendingAction;
        await toggleEstado(calidad.id_calidad, nuevoEstado);
        toast.success(`Calidad ${nuevoEstado ? 'activada' : 'desactivada'}`);
        setConfirmOpen(false);
        setPendingAction(null);
    };

    const handleSaved = () => {
        // Solo cierra el modal – el estado local ya se actualizó en el hook
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
            {/* Barra de herramientas */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
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
                    Nueva Calidad
                </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[700px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Empresa</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Descripción</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Estado</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filteredCalidades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay calidades registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCalidades.map((calidad) => (
                                        <TableRow key={calidad.id_calidad}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{calidad.id_calidad}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {calidad.empresas?.razon_social || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{calidad.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{calidad.descripcion || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={calidad.estado ? 'success' : 'error'}>
                                                    {calidad.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(calidad)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(calidad)}
                                                        className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={calidad.estado ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {calidad.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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

            {/* Modal */}
            <CalidadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingCalidad={selectedCalidad}
                onSaved={handleSaved}
            />

            {/* Diálogo de confirmación */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? 'Activar calidad' : 'Desactivar calidad'}
                message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} la calidad "${pendingAction?.calidad.nombre}"?`}
                confirmText={pendingAction?.nuevoEstado ? 'Activar' : 'Desactivar'}
                variant={pendingAction?.nuevoEstado ? 'info' : 'danger'}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}