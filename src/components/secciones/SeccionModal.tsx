"use client";

import { useState, useEffect } from "react";
import { useSecciones } from "@/hooks/useSecciones";
import { usePuestos } from "@/hooks/usePuestos";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { Seccion } from "@/types/seccion";

interface SeccionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingSeccion?: Seccion | null;
    onSaved: () => void;
}

export function SeccionModal({ open, onOpenChange, editingSeccion, onSaved }: SeccionModalProps) {
    const { create, update } = useSecciones();
    const { puestos, fetchAll: fetchPuestos } = usePuestos();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        id_puesto: "",
        nombre_seccion: "",
        descripcion: "",
        observaciones: "",
        estado: true,
    });

    useEffect(() => {
        fetchPuestos();
    }, []);

    useEffect(() => {
        if (editingSeccion) {
            setForm({
                id_puesto: editingSeccion.id_puesto.toString(),
                nombre_seccion: editingSeccion.nombre_seccion,
                descripcion: editingSeccion.descripcion || "",
                observaciones: editingSeccion.observaciones || "",
                estado: editingSeccion.estado,
            });
        } else {
            setForm({
                id_puesto: "",
                nombre_seccion: "",
                descripcion: "",
                observaciones: "",
                estado: true,
            });
        }
    }, [editingSeccion, open]);

    const puestosOptions = puestos.map(p => ({
        value: p.id_puesto.toString(),
        label: `${p.numero_puesto}${p.referencia ? ` - ${p.referencia}` : ''}`,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                id_puesto: Number(form.id_puesto),
                nombre_seccion: form.nombre_seccion,
                descripcion: form.descripcion || undefined,
                observaciones: form.observaciones || undefined,
                estado: form.estado,
            };
            if (editingSeccion) {
                await update(editingSeccion.id_seccion, payload);
                toast.success("Sección actualizada");
            } else {
                await create(payload);
                toast.success("Sección creada");
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
                    {editingSeccion ? "Editar sección" : "Nueva sección"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingSeccion
                        ? "Modifica los datos de la sección"
                        : "Completa la información para crear una nueva sección"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id_puesto">Puesto *</Label>
                        <Select
                            options={puestosOptions}
                            placeholder="Seleccionar puesto"
                            value={form.id_puesto}
                            onChange={(value) => setForm({ ...form, id_puesto: value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nombre_seccion">Nombre de sección *</Label>
                        <Input
                            id="nombre_seccion"
                            value={form.nombre_seccion}
                            onChange={(e) => setForm({ ...form, nombre_seccion: e.target.value })}
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
                            {submitting ? "Guardando..." : editingSeccion ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}