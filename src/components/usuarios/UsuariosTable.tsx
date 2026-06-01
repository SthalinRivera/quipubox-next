// components/usuarios/UsuariosTable.tsx
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
        if (confirm('¿Desactivar este usuario?')) {
            try {
                await remove(id);
                toast.success('Usuario desactivado');
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    const handleBloquear = async (id: number) => {
        try {
            await bloquear(id);
            toast.success('Usuario bloqueado');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleActivar = async (id: number) => {
        try {
            await activar(id);
            toast.success('Usuario activado');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading && usuarios.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
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

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Nombres
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Apellidos
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Email
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Teléfono
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Sede
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Estado Acceso
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Roles
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {usuarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No hay usuarios registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuarios.map((user) => (
                                        <TableRow
                                            key={`${user.id_usuario}-${user.usuarios_roles?.length || 0}-${user.usuarios_roles?.map(r => r.id_rol_usuario).join(',')}`}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                                                {user.id_usuario}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {user.nombres}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {user.apellidos || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {user.telefono || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {user.sedes?.nombre || '—'}
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
                                                <UserRolesCell usuario={user} />
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    {user.estado_acceso === 'activo' ? (
                                                        <button
                                                            onClick={() => handleBloquear(user.id_usuario)}
                                                            className="text-gray-500 transition-colors hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400"
                                                            title="Bloquear"
                                                        >
                                                            <Lock className="h-4 w-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivar(user.id_usuario)}
                                                            className="text-gray-500 transition-colors hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                                                            title="Activar"
                                                        >
                                                            <Unlock className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user.id_usuario)}
                                                        className="text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                                        title="Desactivar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                onSaved={() => { }} // ya no es necesario recargar
            />
        </div>
    );
}