'use client';

import { useEffect, useState } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useToast } from '@/hooks/useToast';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Pencil, Trash2, Plus, Lock, Unlock } from 'lucide-react';
import { UsuarioModal } from './UsuarioModal';
import { UserRolesCell } from './UserRolesCell';
import type { Usuario } from '@/types/usuario';

export default function UsuariosTable() {
    const { usuarios, loading, fetchAll, remove, bloquear, activar } = useUsuarios();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const handleEdit = (user: Usuario) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de desactivar este usuario?')) {
            try {
                await remove(id);
                toast.success('Usuario desactivado');
                await fetchAll(true);
            } catch (err: any) {
                toast.error(err.message || 'Error al eliminar usuario');
            }
        }
    };

    const handleBloquear = async (id: number) => {
        try {
            await bloquear(id);
            toast.success('Usuario bloqueado');
            await fetchAll(true);
        } catch (err: any) {
            toast.error(err.message || 'Error al bloquear usuario');
        }
    };

    const handleActivar = async (id: number) => {
        try {
            await activar(id);
            toast.success('Usuario activado');
            await fetchAll(true);
        } catch (err: any) {
            toast.error(err.message || 'Error al activar usuario');
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando usuarios...
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

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        ID
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Nombres
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Apellidos
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Email
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Teléfono
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Estado Acceso
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Roles
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {usuarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No hay usuarios registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuarios.map((user) => (
                                        <TableRow key={user.id_usuario}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {user.id_usuario}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {user.nombres}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {user.apellidos || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {user.telefono || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge
                                                    size="sm"
                                                    color={user.estado_acceso === 'activo' ? 'success' : 'error'}
                                                >
                                                    {user.estado_acceso}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <UserRolesCell
                                                    usuario={user}
                                                    onRoleChanged={() => fetchAll(true)}
                                                />
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    {user.estado_acceso === 'activo' ? (
                                                        <button
                                                            onClick={() => handleBloquear(user.id_usuario)}
                                                            className="text-gray-500 transition-colors hover:text-warning-500 dark:text-gray-400 dark:hover:text-yellow-400"
                                                            title="Bloquear"
                                                        >
                                                            <Lock className="h-5 w-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivar(user.id_usuario)}
                                                            className="text-gray-500 transition-colors hover:text-success-500 dark:text-gray-400 dark:hover:text-green-400"
                                                            title="Activar"
                                                        >
                                                            <Unlock className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user.id_usuario)}
                                                        className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-red-400"
                                                        title="Desactivar"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
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
                onSaved={() => fetchAll(true)}
            />
        </div>
    );
}