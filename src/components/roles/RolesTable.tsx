'use client';

import { useEffect, useState } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Rol } from '@/types/rol';

export default function RolesTable() {
    const { roles, loading, fetchAll, create, update, remove } = useRoles();
    const toast = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRol, setEditingRol] = useState<Rol | null>(null);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const openCreateModal = () => {
        setEditingRol(null);
        setForm({ nombre: '', descripcion: '' });
        setModalOpen(true);
    };

    const openEditModal = (rol: Rol) => {
        setEditingRol(rol);
        setForm({ nombre: rol.nombre, descripcion: rol.descripcion || '' });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...form, estado: true };
            if (editingRol) {
                await update(editingRol.id_rol_usuario, payload);
                toast.success('Rol actualizado');
            } else {
                await create(payload);
                toast.success('Rol creado');
            }
            setModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (window.confirm(`¿Desactivar el rol "${nombre}"?`)) {
            try {
                await remove(id);
                toast.success('Rol desactivado');
            } catch (error: any) {
                toast.error(error.message || 'Error al desactivar');
            }
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-700 dark:text-gray-300">
                Cargando roles...
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
                                        Nombre
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Descripción
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400"
                                    >
                                        Estado
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
                                {roles.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No hay roles registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((rol) => (
                                        <TableRow key={rol.id_rol_usuario}>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {rol.id_rol_usuario}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                {rol.nombre}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                {rol.descripcion || '—'}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge
                                                    size="sm"
                                                    color={rol.estado ? 'success' : 'error'}
                                                >
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
                                                        onClick={() =>
                                                            handleDelete(rol.id_rol_usuario, rol.nombre)
                                                        }
                                                        className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
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

            {/* Modal de creación/edición */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                        {editingRol ? 'Editar rol' : 'Nuevo rol'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {editingRol
                            ? 'Modifica los datos del rol'
                            : 'Completa la información para crear un nuevo rol'}
                    </p>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="dark:text-white/90">
                                Nombre *
                            </Label>
                            <Input
                                id="nombre"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                required
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descripcion" className="dark:text-white/90">
                                Descripción
                            </Label>
                            <Input
                                id="descripcion"
                                value={form.descripcion}
                                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting
                                    ? 'Guardando...'
                                    : editingRol
                                        ? 'Actualizar'
                                        : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}