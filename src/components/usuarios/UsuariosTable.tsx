// components/usuarios/UsuariosTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/useToast';
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
import { Pencil, Plus, Power, Play, Lock, Unlock } from 'lucide-react';
import { UsuarioModal } from './UsuarioModal';
import { UserRolesCell } from './UserRolesCell';
import type { Usuario } from '@/types/usuario';
import { TableSkeleton } from '../ui/skeleton/TableSkeleton';

export default function UsuariosTable() {
    const { usuarios, loading, fetchAll, toggleEstado } = useUsuarios();
    const { roles, loading: rolesLoading, fetchAll: fetchRoles } = useRoles();
    const toast = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ user: Usuario; tipo: 'softDelete' | 'acceso' } | null>(null);

    useEffect(() => {
        fetchAll();
        fetchRoles();
    }, []);

    const handleEdit = (user: Usuario) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleToggleEstado = (user: Usuario) => {
        setPendingAction({ user, tipo: 'softDelete' });
        setConfirmOpen(true);
    };

    const handleToggleAcceso = (user: Usuario) => {
        setPendingAction({ user, tipo: 'acceso' });
        setConfirmOpen(true);
    };

    const executeAction = async () => {
        if (!pendingAction) return;
        const { user, tipo } = pendingAction;
        try {
            if (tipo === 'softDelete') {
                const nuevoEstado = !user.estado;
                await toggleEstado(user.id_usuario, nuevoEstado);
                toast.success(`Cuenta de usuario ${nuevoEstado ? 'activada' : 'desactivada'}`);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setConfirmOpen(false);
            setPendingAction(null);
        }
    };

    if (loading && usuarios.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <TableSkeleton columns={7} rows={5} showActionButton={true} />;
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreate} startIcon={<Plus className="h-4 w-4" />}>
                    Nuevo Usuario
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1100px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ID</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Nombres</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Apellidos</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Teléfono</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Sede</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Estado </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Roles</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {usuarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No hay usuarios registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuarios.map((user) => (
                                        <TableRow key={user.id_usuario}>
                                            <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">{user.id_usuario}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.nombres}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{user.apellidos || '—'}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">{user.email}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{user.telefono || '—'}</TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{user.sedes?.nombre || '—'}</TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={user.estado ? 'success' : 'error'}>
                                                    {user.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="px-5 py-4">
                                                <UserRolesCell
                                                    usuario={user}
                                                    roles={roles}
                                                    rolesLoading={rolesLoading}
                                                />
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar usuario"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleEstado(user)}
                                                        className="text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                                        title={user.estado ? 'Desactivar cuenta' : 'Activar cuenta'}
                                                    >
                                                        {user.estado ? <Power className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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

            <UsuarioModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingUser={selectedUser}
                onSaved={() => fetchAll()}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeAction}
                title={
                    pendingAction?.tipo === 'softDelete'
                        ? pendingAction.user.estado
                            ? 'Desactivar cuenta'
                            : 'Activar cuenta'
                        : pendingAction?.user.estado_acceso === 'activo'
                            ? 'Bloquear acceso'
                            : 'Activar acceso'
                }
                message={
                    pendingAction?.tipo === 'softDelete'
                        ? `¿${pendingAction.user.estado ? 'desactivar' : 'activar'} la cuenta del usuario "${pendingAction.user.nombres}"?`
                        : `¿${pendingAction?.user.estado_acceso === 'activo' ? 'bloquear' : 'activar'} el acceso del usuario "${pendingAction?.user.nombres}"?`
                }
                confirmText="Confirmar"
                variant={
                    pendingAction?.tipo === 'softDelete'
                        ? pendingAction.user.estado
                            ? 'danger'
                            : 'success'
                        : 'warning'
                }
            />
        </div>
    );
}