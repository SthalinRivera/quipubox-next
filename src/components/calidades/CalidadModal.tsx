"use client";

import { useState, useEffect } from "react";
import { useCalidades } from "@/hooks/useCalidades";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { Calidad } from "@/types/calidad";

interface CalidadModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCalidad?: Calidad | null;
    onSaved: () => void;
}

export function CalidadModal({ isOpen, onClose, editingCalidad, onSaved }: CalidadModalProps) {
    const { create, update } = useCalidades();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        id_empresa: "",
        nombre: "",
        descripcion: "",
        estado: true,
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    useEffect(() => {
        if (editingCalidad) {
            setForm({
                id_empresa: editingCalidad.id_empresa.toString(),
                nombre: editingCalidad.nombre,
                descripcion: editingCalidad.descripcion || "",
                estado: editingCalidad.estado,
            });
        } else {
            setForm({
                id_empresa: "",
                nombre: "",
                descripcion: "",
                estado: true,
            });
        }
    }, [editingCalidad, isOpen]);

    const empresasOptions = empresas.map(emp => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                id_empresa: Number(form.id_empresa),
                nombre: form.nombre,
                descripcion: form.descripcion || undefined,
                estado: form.estado,
            };
            if (editingCalidad) {
                await update(editingCalidad.id_calidad, payload);
                toast.success("Calidad actualizada");
            } else {
                await create(payload);
                toast.success("Calidad creada");
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
                    {editingCalidad ? "Editar calidad" : "Nueva calidad"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingCalidad
                        ? "Modifica los datos de la calidad"
                        : "Completa la información para crear una nueva calidad"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id_empresa">Empresa *</Label>
                        <Select
                            key={`empresa-select-${form.id_empresa || "empty"}`}
                            options={empresasOptions}
                            placeholder="Seleccionar empresa"
                            defaultValue={form.id_empresa}
                            onChange={(value) => setForm({ ...form, id_empresa: value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                            id="nombre"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input
                            id="descripcion"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <select
                            id="estado"
                            value={form.estado ? "activo" : "inactivo"}
                            onChange={(e) => setForm({ ...form, estado: e.target.value === "activo" })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
                            {submitting ? "Guardando..." : editingCalidad ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}