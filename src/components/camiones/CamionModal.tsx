"use client";

import { useState, useEffect } from "react";
import { useCamiones } from "@/hooks/useCamiones";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { Camion } from "@/types/camion";

interface CamionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCamion?: Camion | null;
    onSaved: () => void;
}

export function CamionModal({ open, onOpenChange, editingCamion, onSaved }: CamionModalProps) {
    const { create, update } = useCamiones();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        id_empresa: "",
        placa: "",
        observaciones: "",
        descripcion: "",
        estado: true,
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    useEffect(() => {
        if (editingCamion) {
            setForm({
                id_empresa: editingCamion.id_empresa.toString(),
                placa: editingCamion.placa,
                observaciones: editingCamion.observaciones || "",
                descripcion: editingCamion.descripcion || "",
                estado: editingCamion.estado,
            });
        } else {
            setForm({
                id_empresa: "",
                placa: "",
                observaciones: "",
                descripcion: "",
                estado: true,
            });
        }
    }, [editingCamion, open]);

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
                placa: form.placa,
                observaciones: form.observaciones || undefined,
                descripcion: form.descripcion || undefined,
                estado: form.estado,
            };
            if (editingCamion) {
                await update(editingCamion.id_camion, payload);
                toast.success("Camión actualizado");
            } else {
                await create(payload);
                toast.success("Camión creado");
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
                    {editingCamion ? "Editar camión" : "Nuevo camión"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingCamion
                        ? "Modifica los datos del camión"
                        : "Completa la información para crear un nuevo camión"}
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
                        <Label htmlFor="placa">Placa *</Label>
                        <Input
                            id="placa"
                            value={form.placa}
                            onChange={(e) => setForm({ ...form, placa: e.target.value })}
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
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Input
                            id="observaciones"
                            value={form.observaciones}
                            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Guardando..." : editingCamion ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}