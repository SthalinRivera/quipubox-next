"use client";

import { useState, useEffect } from "react";
import { useTiposJaba } from "@/hooks/useTiposJaba";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { TipoJaba } from "@/types/tipoJaba";

interface TipoJabaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTipo?: TipoJaba | null;
    onSaved: () => void;
}

export function TipoJabaModal({ open, onOpenChange, editingTipo, onSaved }: TipoJabaModalProps) {
    const { create, update } = useTiposJaba();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        id_empresa: "",
        nombre: "",
        tipo_material: "",
        descripcion: "",
        estado: true,
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    useEffect(() => {
        if (editingTipo) {
            setForm({
                id_empresa: editingTipo.id_empresa.toString(),
                nombre: editingTipo.nombre,
                tipo_material: editingTipo.tipo_material || "",
                descripcion: editingTipo.descripcion || "",
                estado: editingTipo.estado,
            });
        } else {
            setForm({
                id_empresa: "",
                nombre: "",
                tipo_material: "",
                descripcion: "",
                estado: true,
            });
        }
    }, [editingTipo, open]);

    const empresasOptions = empresas.map(emp => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    const materialOptions = [
        { value: "madera", label: "Madera" },
        { value: "plastico", label: "Plástico" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                id_empresa: Number(form.id_empresa),
                nombre: form.nombre,
                tipo_material: form.tipo_material || undefined,
                descripcion: form.descripcion || undefined,
                estado: form.estado,
            };
            if (editingTipo) {
                await update(editingTipo.id_tipo_jaba, payload);
                toast.success("Tipo de jaba actualizado");
            } else {
                await create(payload);
                toast.success("Tipo de jaba creado");
            }
            onSaved();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Error al guardar");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-md">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingTipo ? "Editar tipo de jaba" : "Nuevo tipo de jaba"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingTipo
                        ? "Modifica los datos del tipo de jaba"
                        : "Completa la información para crear un nuevo tipo de jaba"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id_empresa">Empresa *</Label>
                        <Select
                            options={empresasOptions}
                            placeholder="Seleccionar empresa"
                            value={form.id_empresa}
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
                        <Label htmlFor="tipo_material">Tipo de material</Label>
                        <Select
                            options={materialOptions}
                            placeholder="Seleccionar material"
                            value={form.tipo_material}
                            onChange={(value) => setForm({ ...form, tipo_material: value })}
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
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Guardando..." : editingTipo ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}