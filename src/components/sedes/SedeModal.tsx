"use client";

import { useState, useEffect } from "react";
import { useSedes } from "@/hooks/useSedes";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { Sede } from "@/types/sede";

interface SedeModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingSede?: Sede | null;
    onSaved: () => void;
}

export function SedeModal({ isOpen, onClose, editingSede, onSaved }: SedeModalProps) {
    const { create, update } = useSedes();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        id_empresa: "",
        nombre: "",
        tipo_sede: "",
        direccion: "",
        ciudad: "",
        departamento: "",
        estado: true,
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    useEffect(() => {
        if (editingSede) {
            setForm({
                id_empresa: editingSede.id_empresa.toString(),
                nombre: editingSede.nombre,
                tipo_sede: editingSede.tipo_sede || "",
                direccion: editingSede.direccion || "",
                ciudad: editingSede.ciudad || "",
                departamento: editingSede.departamento || "",
                estado: editingSede.estado,
            });
        } else {
            setForm({
                id_empresa: "",
                nombre: "",
                tipo_sede: "",
                direccion: "",
                ciudad: "",
                departamento: "",
                estado: true,
            });
        }
    }, [editingSede, isOpen]);

    const empresasOptions = empresas.map(emp => ({
        value: emp.id_empresa.toString(),
        label: emp.razon_social,
    }));

    const tipoOptions = [
        { value: "origen", label: "Origen" },
        { value: "destino", label: "Destino" },
        { value: "ambos", label: "Ambos" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                id_empresa: Number(form.id_empresa),
                nombre: form.nombre,
                tipo_sede: form.tipo_sede || undefined,
                direccion: form.direccion || undefined,
                ciudad: form.ciudad || undefined,
                departamento: form.departamento || undefined,
                estado: form.estado,
            };
            if (editingSede) {
                await update(editingSede.id_sede, payload);
                toast.success("Sede actualizada");
            } else {
                await create(payload);
                toast.success("Sede creada");
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
                    {editingSede ? "Editar sede" : "Nueva sede"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {editingSede
                        ? "Modifica los datos de la sede"
                        : "Completa la información para crear una nueva sede"}
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
                        <Label htmlFor="tipo_sede">Tipo de sede</Label>
                        <Select
                            options={tipoOptions}
                            placeholder="Seleccionar tipo"
                            value={form.tipo_sede}
                            onChange={(value) => setForm({ ...form, tipo_sede: value })}
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
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Input
                            id="ciudad"
                            value={form.ciudad}
                            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="departamento">Departamento</Label>
                        <Input
                            id="departamento"
                            value={form.departamento}
                            onChange={(e) => setForm({ ...form, departamento: e.target.value })}
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
                            {submitting ? "Guardando..." : editingSede ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}