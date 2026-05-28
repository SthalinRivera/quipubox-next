'use client';

import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useToast } from '@/hooks/useToast';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import Select from '@/components/form/Select';
import { Plus } from 'lucide-react';
import type { Usuario } from '@/types/usuario';

interface UserRolesCellProps {
    usuario: Usuario;
    onRoleChanged: () => void;
}

export function UserRolesCell({ usuario, onRoleChanged }: UserRolesCellProps) {
    const { roles, fetchAll: refetchRoles } = useRoles();
    const { assignRole, removeRole } = useUsuarios();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    // Obtener roles actuales del usuario
    const currentRoles = usuario.usuarios_roles?.map((ur) => ur.roles_usuarios) || [];

    // Filtrar roles disponibles (los que no tiene el usuario)
    const availableRoles = roles.filter(
        (r) => !currentRoles.some((cr) => cr.id_rol_usuario === r.id_rol_usuario),
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
            onRoleChanged();
            refetchRoles();
            setModalOpen(false);
            setSelectedRoleId('');
        } catch (error: any) {
            toast.error(error.message || 'Error al asignar rol');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (rolId: number, rolNombre: string) => {
        if (confirm(`¿Remover el rol "${rolNombre}" de ${usuario.nombres}?`)) {
            try {
                await removeRole(usuario.id_usuario, rolId);
                toast.success('Rol removido');
                onRoleChanged();
                refetchRoles();
            } catch (error: any) {
                toast.error(error.message || 'Error al remover rol');
            }
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                {currentRoles.length === 0 ? (
                    <span className="text-sm text-gray-400 dark:text-gray-500">Sin roles</span>
                ) : (
                    currentRoles.map((rol) => (
                        <Badge key={rol.id_rol_usuario} variant="light" >
                            {rol.nombre}
                            <button
                                onClick={() => handleRemove(rol.id_rol_usuario, rol.nombre)}
                                className="ml-1 text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                aria-label="Remover rol"
                            >
                                ×
                            </button>
                        </Badge>
                    ))
                )}
                {availableRoles.length > 0 && (
                    <Button
                        size="sm"

                        onClick={() => {
                            setSelectedRoleId('');
                            setModalOpen(true);
                        }}
                        className="h-6 px-2 text-xs"
                    >
                        <Plus className="mr-1 h-3 w-3 text-gray-700 dark:text-white/90" />
                        Añadir
                    </Button>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-sm">
                <div className="p-6 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Añadir rol a {usuario.nombres}
                    </h3>
                    <div className="mt-4 space-y-4">
                        <Select
                            key={modalOpen ? 'open' : 'closed'}
                            options={roleOptions}
                            placeholder="Seleccionar rol"
                            defaultValue={selectedRoleId}
                            onChange={(value) => setSelectedRoleId(value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setModalOpen(false)}
                                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={!selectedRoleId || submitting}
                                className="dark:bg-brand-600 dark:hover:bg-brand-700"
                            >
                                {submitting ? 'Asignando...' : 'Asignar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}