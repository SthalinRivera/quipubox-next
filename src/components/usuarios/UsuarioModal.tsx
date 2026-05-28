"use client";

import { useState, useEffect } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { Usuario } from "@/types/usuario";

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
    const { roles } = useRoles();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        nombres: "",
        apellidos: "",
        email: "",
        telefono: "",
        id_rol: "",
        avatar_url: "",
        estado_acceso: "activo" as "activo" | "bloqueado",
    });

    // Cargar datos del usuario a editar
    useEffect(() => {
        if (editingUser) {
            setForm({
                nombres: editingUser.nombres,
                apellidos: editingUser.apellidos || "",
                email: editingUser.email,
                telefono: editingUser.telefono || "",
                id_rol: editingUser.usuarios_roles?.[0]?.id_rol_usuario?.toString() || "",
                avatar_url: editingUser.avatar_url || "",
                estado_acceso: editingUser.estado_acceso,
            });
        } else {
            setForm({
                nombres: "",
                apellidos: "",
                email: "",
                telefono: "",
                id_rol: "",
                avatar_url: "",
                estado_acceso: "activo",
            });
        }
    }, [editingUser, isOpen]);

    const rolesOptions = roles.map((rol) => ({
        value: rol.id_rol_usuario.toString(),
        label: rol.nombre,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Datos básicos del usuario
            const userPayload: any = {
                nombres: form.nombres,
                apellidos: form.apellidos || undefined,
                email: form.email,
                telefono: form.telefono || undefined,
                avatar_url: form.avatar_url || undefined,
                estado_acceso: form.estado_acceso,
                id_empresa: 1, // TODO: obtener del usuario logueado
                estado: true,
            };

            let savedUser: Usuario;
            if (editingUser) {
                // 1. Actualizar datos del usuario
                savedUser = await update(editingUser.id_usuario, userPayload);
                // 2. Manejar cambio de rol
                const newRolId = form.id_rol ? Number(form.id_rol) : null;
                const currentRolId = editingUser.usuarios_roles?.[0]?.id_rol_usuario || null;

                if (newRolId !== currentRolId) {
                    // Remover rol actual si existe
                    if (currentRolId) {
                        await removeRole(editingUser.id_usuario, currentRolId);
                    }
                    // Asignar nuevo rol si se seleccionó
                    if (newRolId) {
                        await assignRole(editingUser.id_usuario, newRolId);
                    }
                }
                toast.success("Usuario actualizado");
            } else {
                // 1. Crear usuario
                savedUser = await create(userPayload);
                // 2. Asignar rol si se seleccionó
                if (form.id_rol) {
                    await assignRole(savedUser.id_usuario, Number(form.id_rol));
                }
                toast.success("Usuario creado");
            }

            onSaved();   // Refrescar lista de usuarios en la tabla
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Error al guardar");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingUser ? "Editar usuario" : "Nuevo usuario"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingUser
                        ? "Modifica los datos del usuario"
                        : "Completa la información para crear un nuevo usuario"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                    <div className="space-y-2">
                        <Label htmlFor="rol">Rol</Label>
                        <Select
                            options={rolesOptions}
                            placeholder="Seleccionar rol"
                            value={form.id_rol}
                            onChange={(value) => setForm({ ...form, id_rol: value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                            id="avatar_url"
                            value={form.avatar_url}
                            onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado_acceso">Estado acceso</Label>
                        <Select
                            options={[
                                { value: "activo", label: "Activo" },
                                { value: "bloqueado", label: "Bloqueado" },
                            ]}
                            value={form.estado_acceso}
                            onChange={(value) =>
                                setForm({ ...form, estado_acceso: value as "activo" | "bloqueado" })
                            }
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}