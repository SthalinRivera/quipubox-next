"use client";

import { useState, useEffect } from "react";
import { usePuestos } from "@/hooks/usePuestos";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useLugarOperativo } from "@/hooks/useLugarOperativo";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { Puesto } from "@/types/puesto";

interface PuestoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingPuesto?: Puesto | null;
    onSaved: () => void;
}

export function PuestoModal({ open, onOpenChange, editingPuesto, onSaved }: PuestoModalProps) {
    const { create, update } = usePuestos();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const { lugarOpertivo, fetchAll: fetchMercados } = useLugarOperativo();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        id_empresa: "",
        id_lugar: "",
        numero_puesto: "",
        referencia: "",
        estado: true,
    });

    useEffect(() => {
        fetchEmpresas();
        fetchMercados();
    }, []);

    useEffect(() => {
        if (editingPuesto) {
            setForm({
                id_empresa: editingPuesto.id_empresa.toString(),
                id_lugar: editingPuesto.id_lugar.toString(),
                numero_puesto: editingPuesto.numero_puesto,
                referencia: editingPuesto.referencia || "",
                estado: editingPuesto.estado,
            });
        } else {
            setForm({
                id_empresa: "",
                id_lugar: "",
                numero_puesto: "",
                referencia: "",
                estado: true,
            });
        }
    }, [editingPuesto, open]);

    const empresasOptions = empresas.map(emp => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    // Filtrar mercados por empresa seleccionada
    const mercadosFiltrados = lugarOpertivo.filter(m => m.id_empresa === Number(form.id_empresa));
    const mercadosOptions = mercadosFiltrados.map(m => ({
        value: m.id_lugar.toString(),
        label: m.nombre,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                id_empresa: Number(form.id_empresa),
                id_lugar: Number(form.id_lugar),
                numero_puesto: form.numero_puesto,
                referencia: form.referencia || undefined,
                estado: form.estado,
            };
            if (editingPuesto) {
                await update(editingPuesto.id_puesto, payload);
                toast.success("Puesto actualizado");
            } else {
                await create(payload);
                toast.success("Puesto creado");
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
                    {editingPuesto ? "Editar puesto" : "Nuevo puesto"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingPuesto
                        ? "Modifica los datos del puesto"
                        : "Completa la información para crear un nuevo puesto"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id_empresa">Empresa *</Label>
                        <Select
                            options={empresasOptions}
                            placeholder="Seleccionar empresa"
                            value={form.id_empresa}
                            onChange={(value) => {
                                setForm({ ...form, id_empresa: value, id_lugar: "" });
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="id_lugar">Mercado *</Label>
                        <Select
                            options={mercadosOptions}
                            placeholder="Seleccionar mercado"
                            value={form.id_lugar}
                            onChange={(value) => setForm({ ...form, id_lugar: value })}
                            disabled={!form.id_empresa}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero_puesto">Número de puesto *</Label>
                        <Input
                            id="numero_puesto"
                            value={form.numero_puesto}
                            onChange={(e) => setForm({ ...form, numero_puesto: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referencia">Referencia</Label>
                        <Input
                            id="referencia"
                            value={form.referencia}
                            onChange={(e) => setForm({ ...form, referencia: e.target.value })}
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
                            {submitting ? "Guardando..." : editingPuesto ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}