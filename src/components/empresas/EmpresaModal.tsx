"use client";

import { useState, useEffect } from "react";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { Empresa } from "@/types/empresa";

interface EmpresaModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEmpresa?: Empresa | null;
    onSaved: () => void;
}

export function EmpresaModal({
    isOpen,
    onClose,
    editingEmpresa,
    onSaved,
}: EmpresaModalProps) {
    const { create, update } = useEmpresas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        razon_social: "",
        nombre_comercial: "",
        ruc: "",
        telefono: "",
        direccion: "",
        estado: true,
    });

    useEffect(() => {
        if (editingEmpresa) {
            setForm({
                razon_social: editingEmpresa.razon_social,
                nombre_comercial: editingEmpresa.nombre_comercial,
                ruc: editingEmpresa.ruc || "",
                telefono: editingEmpresa.telefono || "",
                direccion: editingEmpresa.direccion || "",
                estado: editingEmpresa.estado,
            });
        } else {
            setForm({
                razon_social: "",
                nombre_comercial: "",
                ruc: "",
                telefono: "",
                direccion: "",
                estado: true,
            });
        }
    }, [editingEmpresa, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                razon_social: form.razon_social,
                nombre_comercial: form.nombre_comercial,
                ruc: form.ruc || undefined,
                telefono: form.telefono || undefined,
                direccion: form.direccion || undefined,
                estado: form.estado,
            };
            if (editingEmpresa) {
                await update(editingEmpresa.id_empresa, payload);
                toast.success("Empresa actualizada");
            } else {
                await create(payload);
                toast.success("Empresa creada");
            }
            onSaved();
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
                    {editingEmpresa ? "Editar empresa" : "Nueva empresa"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingEmpresa
                        ? "Modifica los datos de la empresa"
                        : "Completa la información para crear una nueva empresa"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="razon_social">Razón Social *</Label>
                        <Input
                            id="razon_social"
                            value={form.razon_social}
                            onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nombre_comercial">Nombre Comercial *</Label>
                        <Input
                            id="nombre_comercial"
                            value={form.nombre_comercial}
                            onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ruc">RUC</Label>
                        <Input
                            id="ruc"
                            value={form.ruc}
                            onChange={(e) => setForm({ ...form, ruc: e.target.value })}
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
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                            id="direccion"
                            value={form.direccion}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <select
                            id="estado"
                            value={form.estado ? "activo" : "inactivo"}
                            onChange={(e) => setForm({ ...form, estado: e.target.value === "activo" })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Guardando..." : editingEmpresa ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}