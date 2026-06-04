"use client";

import { useState, useEffect } from "react";
import { useGuiasOperativas } from "@/hooks/useGuiasOperativas";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { fetchWithAuth } from "@/lib/api-client";
import type { GuiaOperativa, CreateGuiaOperativaDto } from "@/types/guiaOperativa";

interface GuiaOperativaModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingGuia?: GuiaOperativa | null;
    onSaved: () => void;
}

export function GuiaOperativaModal({
    isOpen,
    onClose,
    editingGuia,
    onSaved,
}: GuiaOperativaModalProps) {
    const { createGuia, updateGuia } = useGuiasOperativas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [repartidores, setRepartidores] = useState<
        { id_usuario: number; nombres: string; apellidos?: string }[]
    >([]);
    const [itemsReparto, setItemsReparto] = useState<
        { id_item_reparto: number; id_detalle_carga: number; id_cliente_receptor?: number }[]
    >([]);

    const [form, setForm] = useState<CreateGuiaOperativaDto>({
        numero_guia: "",
        fecha_emision: new Date().toISOString().split("T")[0],
        id_repartidor: null,
        observaciones: "",
        id_item_reparto: 0,
        estado: "emitida",
    });

    useEffect(() => {
        if (!isOpen) return;
        const loadData = async () => {
            try {
                const [usuariosRes, itemsRes] = await Promise.all([
                    fetchWithAuth<any[]>("usuarios"),
                    fetchWithAuth<any[]>("items-reparto"),
                ]);
                setRepartidores(usuariosRes || []);
                setItemsReparto(itemsRes || []);
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar datos auxiliares");
            }
        };
        loadData();
    }, [isOpen, toast]);

    useEffect(() => {
        if (editingGuia) {
            setForm({
                numero_guia: editingGuia.numero_guia,
                fecha_emision: editingGuia.fecha_emision.split("T")[0],
                id_repartidor: editingGuia.id_repartidor,
                observaciones: editingGuia.observaciones || "",
                id_item_reparto: editingGuia.id_item_reparto,
                estado: editingGuia.estado,
            });
        } else {
            setForm({
                numero_guia: "",
                fecha_emision: new Date().toISOString().split("T")[0],
                id_repartidor: null,
                observaciones: "",
                id_item_reparto: 0,
                estado: "emitida",
            });
        }
    }, [editingGuia, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.numero_guia || form.id_item_reparto === 0) {
            toast.error("Complete los campos obligatorios (número guía, item reparto)");
            return;
        }
        setSubmitting(true);
        try {
            if (editingGuia) {
                await updateGuia(editingGuia.id_guia, form);
                toast.success("Guía actualizada");
            } else {
                await createGuia(form);
                toast.success("Guía creada");
            }
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingGuia ? "Editar guía" : "Nueva guía operativa"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos de la guía operativa
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {/* Número de Guía */}
                    <div className="space-y-2">
                        <Label htmlFor="numero_guia" className="text-gray-700 dark:text-gray-300">
                            Número de Guía *
                        </Label>
                        <Input
                            id="numero_guia"
                            value={form.numero_guia}
                            onChange={(e) => setForm({ ...form, numero_guia: e.target.value })}
                            placeholder="Ej: G-2026-001"
                            required
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    {/* Fecha Emisión */}
                    <div className="space-y-2">
                        <Label htmlFor="fecha_emision" className="text-gray-700 dark:text-gray-300">
                            Fecha Emisión *
                        </Label>
                        <Input
                            id="fecha_emision"
                            type="date"
                            value={form.fecha_emision}
                            onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                            required
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    {/* Repartidor */}
                    <div className="space-y-2">
                        <Label htmlFor="repartidor" className="text-gray-700 dark:text-gray-300">
                            Repartidor (opcional)
                        </Label>
                        <select
                            id="repartidor"
                            value={form.id_repartidor ?? 0}
                            onChange={(e) =>
                                setForm({ ...form, id_repartidor: parseInt(e.target.value) || null })
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value={0}>-- Sin asignar --</option>
                            {repartidores.map((r) => (
                                <option key={r.id_usuario} value={r.id_usuario}>
                                    {r.nombres} {r.apellidos || ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Item de Reparto */}
                    <div className="space-y-2">
                        <Label htmlFor="item_reparto" className="text-gray-700 dark:text-gray-300">
                            Item de Reparto *
                        </Label>
                        <select
                            id="item_reparto"
                            value={form.id_item_reparto}
                            onChange={(e) => setForm({ ...form, id_item_reparto: parseInt(e.target.value) })}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value={0}>Seleccione un item de reparto</option>
                            {itemsReparto.map((item) => (
                                <option key={item.id_item_reparto} value={item.id_item_reparto}>
                                    #{item.id_item_reparto} (Detalle: {item.id_detalle_carga})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                        <Label htmlFor="estado" className="text-gray-700 dark:text-gray-300">
                            Estado
                        </Label>
                        <select
                            id="estado"
                            value={form.estado}
                            onChange={(e) => setForm({ ...form, estado: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value="emitida">Emitida</option>
                            <option value="firmada">Firmada</option>
                            <option value="anulada">Anulada</option>
                            <option value="reemplazada">Reemplazada</option>
                            <option value="observada">Observada</option>
                        </select>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                        <Label htmlFor="observaciones" className="text-gray-700 dark:text-gray-300">
                            Observaciones
                        </Label>
                        <textarea
                            id="observaciones"
                            rows={2}
                            value={form.observaciones || ""}
                            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                            placeholder="Observaciones adicionales"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Guardando..." : editingGuia ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}