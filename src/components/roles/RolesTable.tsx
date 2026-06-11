// components/roles/RolesTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/useToast';
import { RolModal } from '@/components/roles/RolModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Pencil, Plus, Power, Play } from 'lucide-react';
import type { Rol } from '@/types/rol';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function RolesTable() {
    const { roles, loading, fetchAll, toggleEstado } = useRoles();
    const toast = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRol, setEditingRol] = useState<Rol | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ rol: Rol; nuevoEstado: boolean } | null>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const openCreateModal = () => {
        setEditingRol(null);
        setModalOpen(true);
    };

    const openEditModal = (rol: Rol) => {
        setEditingRol(rol);
        setModalOpen(true);
    };

    const handleToggle = (rol: Rol) => {
        const nuevoEstado = !rol.estado;
        setPendingAction({ rol, nuevoEstado });
        setConfirmOpen(true);
    };

    const executeToggle = async () => {
        if (!pendingAction) return;
        const { rol, nuevoEstado } = pendingAction;
        await toggleEstado(rol.id_rol_usuario, nuevoEstado);
        toast.success(`Rol ${nuevoEstado ? 'activado' : 'desactivado'}`);
        setConfirmOpen(false);
        setPendingAction(null);
    };

    const handleSaved = () => {
        setModalOpen(false);
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
                <Button onClick={openCreateModal} startIcon={<Plus className="h-4 w-4" />}>
                    Nuevo Rol
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
                                {roles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay roles registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((rol) => (
                                        <TableRow key={rol.id_rol_usuario}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{rol.id_rol_usuario}</TableCell>
                                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{rol.nombre}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{rol.descripcion || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={rol.estado ? 'success' : 'error'}>
                                                    {rol.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => openEditModal(rol)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(rol)}
                                                        className="text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                                                        title={rol.estado ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {rol.estado ? <Power className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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

            <RolModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                editingRol={editingRol}
                onSaved={handleSaved}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeToggle}
                title={pendingAction?.nuevoEstado ? 'Activar rol' : 'Desactivar rol'}
                message={`¿${pendingAction?.nuevoEstado ? 'activar' : 'desactivar'} el rol "${pendingAction?.rol.nombre}"?`}
                confirmText={pendingAction?.nuevoEstado ? 'Activar' : 'Desactivar'}
                variant={pendingAction?.nuevoEstado ? 'info' : 'danger'}
                icon={pendingAction?.nuevoEstado ? <Play className="h-5 w-5" /> : <Power className="h-5 w-5" />}
            />
        </div>
    );
}