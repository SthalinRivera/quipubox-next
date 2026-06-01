// components/usuarios/UserRolesCell.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useToast } from '@/hooks/useToast';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import Select from '@/components/form/Select';
import { Plus } from 'lucide-react';
import type { Usuario } from '@/types/usuario';

export function UserRolesCell({ usuario }: { usuario: Usuario }) {
    const { roles, loading: rolesLoading } = useRoles();
    const { assignRole, removeRole } = useUsuarios();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handleRemove = async (rolId: number, rolNombre: string) => {
        if (confirm(`¿Remover el rol "${rolNombre}" de ${usuario.nombres}?`)) {
            try {
                await removeRole(usuario.id_usuario, rolId);
                toast.success('Rol removido');
            } catch (error: any) {
                toast.error(error.message || 'Error al remover rol');
            }
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {currentRoles.length === 0 ? (
                    <span className="text-sm text-gray-400">Sin roles</span>
                ) : (
                    currentRoles.map((rol) => (
                        <Badge key={rol.id_rol_usuario} variant="light">
                            {rol.nombre}
                            <button
                                onClick={() => handleRemove(rol.id_rol_usuario, rol.nombre)}
                                className="ml-1 hover:text-red-500"
                            >
                                ×
                            </button>
                        </Badge>
                    ))
                )}
                {availableRoles.length > 0 && (
                    <Button size="sm" onClick={() => setModalOpen(true)} className="h-6 px-2 text-xs">
                        <Plus className="mr-1 h-3 w-3" />
                        Añadir
                    </Button>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-sm">
                <div className="p-6 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold">Añadir rol a {usuario.nombres}</h3>
                    <div className="mt-4 space-y-4">
                        {rolesLoading ? (
                            <p>Cargando roles...</p>
                        ) : (
                            <Select
                                options={roleOptions}
                                placeholder="Seleccionar rol"
                                value={selectedRoleId}
                                onChange={(value) => setSelectedRoleId(value)}
                            />
                        )}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleAssign} disabled={!selectedRoleId || submitting || rolesLoading}>
                                {submitting ? 'Asignando...' : 'Asignar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}