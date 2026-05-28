"use client";

import { useState, useEffect } from "react";
import { useMercados } from "@/hooks/useMercados";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useSedes } from "@/hooks/useSedes";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { Mercado } from "@/types/mercado";

interface MercadoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingMercado?: Mercado | null;
    onSaved: () => void;
}

export function MercadoModal({ open, onOpenChange, editingMercado, onSaved }: MercadoModalProps) {
    const { create, update } = useMercados();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const { sedes, fetchAll: fetchSedes } = useSedes();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");

    const [form, setForm] = useState({
        id_empresa: "",
        id_sede: "",
        nombre: "",
        direccion_referencia: "",
        observaciones: "",
        estado: true,
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    // Cargar sedes cuando cambia la empresa seleccionada
    useEffect(() => {
        if (form.id_empresa) {
            fetchSedes();
        }
    }, [form.id_empresa, fetchSedes]);

    // Filtrar sedes por empresa seleccionada
    const sedesFiltradas = sedes.filter(s => s.id_empresa === Number(form.id_empresa));

    useEffect(() => {
        if (editingMercado) {
            setForm({
                id_empresa: editingMercado.id_empresa.toString(),
                id_sede: editingMercado.id_sede.toString(),
                nombre: editingMercado.nombre,
                direccion_referencia: editingMercado.direccion_referencia || "",
                observaciones: editingMercado.observaciones || "",
                estado: editingMercado.estado,
            });
            setSelectedEmpresaId(editingMercado.id_empresa.toString());
        } else {
            setForm({
                id_empresa: "",
                id_sede: "",
                nombre: "",
                direccion_referencia: "",
                observaciones: "",
                estado: true,
            });
            setSelectedEmpresaId("");
        }
    }, [editingMercado, open]);

    const empresasOptions = empresas.map(emp => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    const sedesOptions = sedesFiltradas.map(s => ({
        value: s.id_sede.toString(),
        label: s.nombre,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                id_empresa: Number(form.id_empresa),
                id_sede: Number(form.id_sede),
                nombre: form.nombre,
                direccion_referencia: form.direccion_referencia || undefined,
                observaciones: form.observaciones || undefined,
                estado: form.estado,
            };
            if (editingMercado) {
                await update(editingMercado.id_lugar, payload);
                toast.success("Mercado actualizado");
            } else {
                await create(payload);
                toast.success("Mercado creado");
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
                    {editingMercado ? "Editar mercado" : "Nuevo mercado"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingMercado
                        ? "Modifica los datos del mercado"
                        : "Completa la información para crear un nuevo mercado"}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id_empresa">Empresa *</Label>
                        <Select
                            key={`empresa-select-${form.id_empresa || "empty"}`}
                            options={empresasOptions}
                            placeholder="Seleccionar empresa"
                            defaultValue={form.id_empresa}
                            onChange={(value) => {
                                setForm({ ...form, id_empresa: value, id_sede: "" });
                                setSelectedEmpresaId(value);
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="id_sede">Sede *</Label>
                        <Select
                            key={`sede-select-${form.id_sede || "empty"}`}
                            options={sedesOptions}
                            placeholder="Seleccionar sede"
                            defaultValue={form.id_sede}
                            onChange={(value) => setForm({ ...form, id_sede: value })}
                            disabled={!form.id_empresa}
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
                        <Label htmlFor="direccion_referencia">Dirección / Referencia</Label>
                        <Input
                            id="direccion_referencia"
                            value={form.direccion_referencia}
                            onChange={(e) => setForm({ ...form, direccion_referencia: e.target.value })}
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
                            {submitting ? "Guardando..." : editingMercado ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}