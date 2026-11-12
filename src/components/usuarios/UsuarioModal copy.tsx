// components/usuarios/UsuarioModal.tsx (versión corregida)
'use client';

import { useState, useEffect } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useRoles } from '@/hooks/useRoles';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import type { Usuario } from '@/types/usuario';

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser?: Usuario | null;
    onSaved: () => void;
}

export function UsuarioModal({
    isOpen,
    onClose,
    editingUser,
    onSaved,
}: UsuarioModalProps) {
    const { create, update, assignRole, removeRole } = useUsuarios();

    const { empresas, loading: loadingEmpresas, fetchAll: fetchEmpresas } = useEmpresas();
    const { ubicaciones, loading: loadingUbicacións } = useUbicaciones();
    const { roles, fetchAll: fetchRoles } = useRoles();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>(undefined);

    const [form, setForm] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        id_rol_usuario: '',
        estado_acceso: 'activo' as 'activo' | 'bloqueado',
        id_empresa: '',
        id_ubigeo: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchEmpresas();
            fetchRoles();
        }
    }, [isOpen, fetchEmpresas]);

    useEffect(() => {
        if (editingUser) {
            setForm({
                nombres: editingUser.nombres,
                apellidos: editingUser.apellidos || '',
                email: editingUser.email,
                telefono: editingUser.telefono || '',
                id_rol_usuario: editingUser.usuarios_roles?.[0]?.id_rol_usuario?.toString() || '',
                estado_acceso: editingUser.estado_acceso,
                id_empresa: editingUser.id_empresa?.toString() || '',
                // ✅ Convertir null/undefined a cadena vacía
                id_ubigeo: editingUser.id_ubigeo ? editingUser.id_ubigeo.toString() : '',
            });
            setSelectedEmpresaId(editingUser.id_empresa);
        } else {
            setForm({
                nombres: '',
                apellidos: '',
                email: '',
                telefono: '',
                id_rol_usuario: '',
                estado_acceso: 'activo',
                id_empresa: '',
                id_ubigeo: '',
            });
            setSelectedEmpresaId(undefined);
        }
    }, [editingUser, isOpen]);

    const rolesOptions = roles.map((rol) => ({
        value: rol.id_rol_usuario.toString(),
        label: rol.nombre,
    }));

    const empresasOptions = empresas.map((emp) => ({
        value: emp.id_empresa.toString(),
        label: emp.nombre_comercial || emp.razon_social,
    }));

    const ubicacionsFiltradas = ubicaciones;
    const ubicacionsOptions = ubicacionsFiltradas.map((ubicacion) => ({
        value: ubicacion.id_ubigeo.toString(),
        label: ubicacion.nombre,
    }));

    const handleEmpresaChange = (value: string) => {
        const empresaId = Number(value);
        setSelectedEmpresaId(empresaId);
        setForm((prev) => ({ ...prev, id_empresa: value, id_ubigeo: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.id_empresa || !form.id_ubigeo) {
            toast.error('Debe seleccionar empresa y ubicacion');
            return;
        }
        if (!form.nombres || !form.email) {
            toast.error('Nombres y email son obligatorios');
            return;
        }

        setSubmitting(true);
        try {
            // ✅ Asegurar que id_ubigeo sea number o undefined (nunca null o NaN)
            const ubicacionId = form.id_ubigeo ? Number(form.id_ubigeo) : undefined;
            if (ubicacionId === undefined || isNaN(ubicacionId)) {
                toast.error('Ubicación inválida');
                return;
            }

            const userPayload = {
                nombres: form.nombres,
                apellidos: form.apellidos || undefined,
                email: form.email,
                telefono: form.telefono || undefined,
                estado_acceso: form.estado_acceso,
                id_empresa: Number(form.id_empresa),
                id_ubigeo: ubicacionId,
                estado: true,
            };

            let savedUser: Usuario;
            if (editingUser) {
                savedUser = await update(editingUser.id_usuario, userPayload);
                const newRolId = form.id_rol_usuario ? Number(form.id_rol_usuario) : null;
                const currentRolId = editingUser.usuarios_roles?.[0]?.id_rol_usuario || null;
                if (newRolId !== currentRolId) {
                    if (currentRolId) await removeRole(editingUser.id_usuario, currentRolId);
                    if (newRolId) await assignRole(editingUser.id_usuario, newRolId);
                }
                toast.success('Usuario actualizado');
            } else {
                savedUser = await create(userPayload);
                if (form.id_rol_usuario) {
                    await assignRole(savedUser.id_usuario, Number(form.id_rol_usuario));
                }
                toast.success('Usuario creado');
            }
            onSaved();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    const isUbicaciónDisabled = !selectedEmpresaId || loadingUbicacións;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingUser
                        ? 'Modifica los datos del usuario'
                        : 'Completa la información para crear un nuevo usuario'}
                </p>

                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Columna izquierda */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombres">Nombres *</Label>
                                <Input
                                    id="nombres"
                                    value={form.nombres}
                                    onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellidos">Apellidos</Label>
                                <Input
                                    id="apellidos"
                                    value={form.apellidos}
                                    onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input
                                    id="telefono"
                                    value={form.telefono}
                                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Columna derecha */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="empresa">Empresa *</Label>
                                {loadingEmpresas ? (
                                    <p className="text-sm text-gray-400">Cargando empresas...</p>
                                ) : empresas.length === 0 ? (
                                    <p className="text-sm text-red-500">No hay empresas disponibles</p>
                                ) : (
                                    <div className="bg-white dark:bg-gray-800 rounded-md">
                                        <Select
                                            options={empresasOptions}
                                            placeholder="Seleccionar empresa"
                                            value={form.id_empresa}
                                            onChange={handleEmpresaChange}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ubicacion">Ubicación *</Label>
                                <div className="bg-white dark:bg-gray-800 rounded-md">
                                    <Select
                                        options={ubicacionsOptions}
                                        placeholder={
                                            selectedEmpresaId
                                                ? "Seleccionar ubicacion"
                                                : "Primero selecciona una empresa"
                                        }
                                        value={form.id_ubigeo}
                                        onChange={(val) => setForm({ ...form, id_ubigeo: val })}
                                    />
                                </div>
                                {loadingUbicacións && (
                                    <p className="text-sm text-gray-400">Cargando ubicaciones...</p>
                                )}
                                {!loadingUbicacións && selectedEmpresaId && ubicacionsFiltradas.length === 0 && (
                                    <p className="text-sm text-yellow-500">
                                        Esta empresa no tiene ubicaciones registradas
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rol">Rol</Label>
                                <div className="bg-white dark:bg-gray-800 rounded-md">
                                    <Select
                                        options={rolesOptions}
                                        placeholder="Seleccionar rol"
                                        value={form.id_rol_usuario}
                                        onChange={(value) => setForm({ ...form, id_rol_usuario: value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado_acceso">Estado acceso</Label>
                                <div className="bg-white dark:bg-gray-800 rounded-md">
                                    <Select
                                        options={[
                                            { value: 'activo', label: 'Activo' },
                                            { value: 'bloqueado', label: 'Bloqueado' },
                                        ]}
                                        value={form.estado_acceso}
                                        onChange={(value) =>
                                            setForm({
                                                ...form,
                                                estado_acceso: value as 'activo' | 'bloqueado',
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 mt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}