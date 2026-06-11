// components/usuarios/UserRolesCell.tsx
'use client';

import { useState, useMemo } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { Plus, Shield, Trash2 } from 'lucide-react';
import type { Usuario } from '@/types/usuario';
import type { Rol } from '@/types/rol';

interface UserRolesCellProps {
    usuario: Usuario;
    roles: Rol[];
    rolesLoading?: boolean;
}

export function UserRolesCell({ usuario, roles, rolesLoading = false }: UserRolesCellProps) {
    const { assignRole, removeRole } = useUsuarios();
    const toast = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [roleToRemove, setRoleToRemove] = useState<{ id: number; nombre: string } | null>(null);

    const currentRoles = useMemo(
        () => usuario.usuarios_roles?.map((ur) => ur.roles_usuarios) || [],
        [usuario.usuarios_roles]
    );

    const availableRoles = useMemo(
        () => roles.filter((r) => !currentRoles.some((cr) => cr.id_rol_usuario === r.id_rol_usuario)),
        [roles, currentRoles]
    );

    const roleOptions = availableRoles.map((rol) => ({
        value: rol.id_rol_usuario.toString(),
        label: rol.nombre,
    }));

    const handleAssign = async () => {
        if (!selectedRoleId) return;
        setSubmitting(true);
        try {
            await assignRole(usuario.id_usuario, Number(selectedRoleId));
            toast.success('Rol asignado');
            setModalOpen(false);
            setSelectedRoleId('');
        } catch (error: any) {
            toast.error(error.message || 'Error al asignar rol');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveClick = (rolId: number, rolNombre: string) => {
        setRoleToRemove({ id: rolId, nombre: rolNombre });
        setConfirmOpen(true);
    };

    const executeRemove = async () => {
        if (!roleToRemove) return;
        try {
            await removeRole(usuario.id_usuario, roleToRemove.id);
            toast.success(`Rol "${roleToRemove.nombre}" removido`);
        } catch (error: any) {
            toast.error(error.message || 'Error al remover rol');
        } finally {
            setConfirmOpen(false);
            setRoleToRemove(null);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRoleId('');
    };

    return (
        <>
            <div className="flex flex-wrap gap-2 items-center">
                {currentRoles.length === 0 ? (
                    <span className="text-sm text-gray-400">Sin roles</span>
                ) : (
                    currentRoles.map((rol) => (
                        <Badge key={rol.id_rol_usuario} variant="light">

                            {rol.nombre}
                            <button
                                onClick={() => handleRemoveClick(rol.id_rol_usuario, rol.nombre)}
                                className="ml-1 hover:text-red-500 transition-colors"
                                aria-label="Remover rol"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))
                )}
                {availableRoles.length > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setModalOpen(true)} className="h-6 px-2 text-xs">
                        <Plus className="mr-1 h-3 w-3" />
                        Añadir
                    </Button>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={handleCloseModal} className="max-w-md p-5">
                <div className="space-y-5">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Roles de {usuario.nombres}
                        </h3>
                    </div>

                    {/* Lista de roles asignados dentro del modal */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            📌 Roles asignados
                        </Label>
                        <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700">
                            {currentRoles.length === 0 ? (
                                <li className="text-sm text-gray-500 italic text-center py-2">
                                    Sin roles asignados. Agrega uno más abajo.
                                </li>
                            ) : (
                                currentRoles.map((rol) => (
                                    <li key={rol.id_rol_usuario} className="flex justify-between items-center border-b pb-2 last:border-0 dark:border-gray-700">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{rol.nombre}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {rol.id_rol_usuario}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveClick(rol.id_rol_usuario, rol.nombre)}
                                            className="text-red-500 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:text-red-300"
                                            title="Remover rol"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Formulario para agregar nuevo rol (sin buscador) */}
                    <div className="border-t pt-4 space-y-4 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Plus className="h-4 w-4" /> Asignar nuevo rol
                        </p>

                        <div>
                            <Label htmlFor="rolSelect" className="text-gray-700 dark:text-gray-300">
                                Seleccionar rol
                            </Label>
                            <Select
                                options={roleOptions}
                                placeholder={availableRoles.length === 0 ? '— No hay roles disponibles —' : '— Elige un rol —'}
                                value={selectedRoleId}
                                onChange={setSelectedRoleId}
                                disabled={availableRoles.length === 0 || rolesLoading}
                            />
                            {availableRoles.length === 0 && !rolesLoading && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    No hay roles disponibles para asignar.
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleAssign}
                            disabled={submitting || !selectedRoleId || availableRoles.length === 0 || rolesLoading}
                            size="sm"
                            className="w-full"
                        >
                            {submitting ? 'Asignando...' : '➕ Asignar rol'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeRemove}
                title="Remover rol"
                message={`¿Remover el rol "${roleToRemove?.nombre}" de ${usuario.nombres}?`}
                confirmText="Remover"
                variant="warning"
            />
        </>
    );
}