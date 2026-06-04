"use client";

import { useState, useEffect } from "react";
import { useItemsReparto } from "@/hooks/useItemsReparto";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { fetchWithAuth } from "@/lib/api-client";
import type { ItemReparto, CreateItemRepartoDto } from "@/types/itemReparto";

interface ItemRepartoModalProps {
    isOpen: boolean;
    onClose: () => void;
    detalleId?: number;
    editingItem?: ItemReparto | null;
    onSaved: () => void;
}

export function ItemRepartoModal({
    isOpen,
    onClose,
    detalleId,
    editingItem,
    onSaved,
}: ItemRepartoModalProps) {
    const { createItem, updateItem } = useItemsReparto();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [clientes, setClientes] = useState<
        { id_cliente: number; nombres: string; apellidos?: string }[]
    >([]);
    const [puestos, setPuestos] = useState<{ id_puesto: number; numero_puesto: string }[]>([]);
    const [secciones, setSecciones] = useState<string[]>(["A", "B", "C"]);

    const [form, setForm] = useState<CreateItemRepartoDto>({
        id_detalle_carga: detalleId || 0,
        id_cliente_receptor: null,
        id_puesto: 0,
        cantidad_asignada: 1,
        orden_entrega: 1,
        observaciones: "",
        seccion: "",
    });

    useEffect(() => {
        if (!isOpen) return;
        const loadData = async () => {
            try {
                const [clientesRes, puestosRes] = await Promise.all([
                    fetchWithAuth<any[]>("clientes"),
                    fetchWithAuth<any[]>("puestos"),
                ]);
                setClientes(clientesRes || []);
                setPuestos(puestosRes || []);
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar datos");
            }
        };
        loadData();
    }, [isOpen, toast]);

    useEffect(() => {
        if (editingItem) {
            setForm({
                id_detalle_carga: editingItem.id_detalle_carga,
                id_cliente_receptor: editingItem.id_cliente_receptor,
                id_puesto: editingItem.id_puesto,
                cantidad_asignada: editingItem.cantidad_asignada,
                orden_entrega: editingItem.orden_entrega,
                observaciones: editingItem.observaciones || "",
                seccion: editingItem.seccion || "",
            });
        } else {
            setForm({
                id_detalle_carga: detalleId || 0,
                id_cliente_receptor: null,
                id_puesto: 0,
                cantidad_asignada: 1,
                orden_entrega: 1,
                observaciones: "",
                seccion: "",
            });
        }
    }, [editingItem, detalleId, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id_puesto === 0 || form.cantidad_asignada <= 0) {
            toast.error("Complete los campos obligatorios");
            return;
        }
        setSubmitting(true);
        try {
            if (editingItem) {
                await updateItem(editingItem.id_item_reparto, form);
                toast.success("Item actualizado");
            } else {
                await createItem(form);
                toast.success("Item creado");
            }
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingItem ? "Editar reparto" : "Nuevo reparto"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos del item de reparto
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {/* Cliente Receptor */}
                    <div className="space-y-2">
                        <Label htmlFor="cliente" className="text-gray-700 dark:text-gray-300">
                            Cliente Receptor (opcional)
                        </Label>
                        <select
                            id="cliente"
                            value={form.id_cliente_receptor ?? 0}
                            onChange={(e) =>
                                setForm({ ...form, id_cliente_receptor: parseInt(e.target.value) || null })
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value={0}>-- Ninguno --</option>
                            {clientes.map((c) => (
                                <option key={c.id_cliente} value={c.id_cliente}>
                                    {c.nombres} {c.apellidos || ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Puesto */}
                    <div className="space-y-2">
                        <Label htmlFor="puesto" className="text-gray-700 dark:text-gray-300">
                            Puesto *
                        </Label>
                        <select
                            id="puesto"
                            value={form.id_puesto}
                            onChange={(e) => setForm({ ...form, id_puesto: parseInt(e.target.value) })}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value={0}>Seleccione un puesto</option>
                            {puestos.map((p) => (
                                <option key={p.id_puesto} value={p.id_puesto}>
                                    {p.numero_puesto}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cantidad Asignada */}
                    <div className="space-y-2">
                        <Label htmlFor="cantidad" className="text-gray-700 dark:text-gray-300">
                            Cantidad Asignada *
                        </Label>
                        <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            value={form.cantidad_asignada}
                            onChange={(e) =>
                                setForm({ ...form, cantidad_asignada: parseInt(e.target.value) || 1 })
                            }
                            required
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    {/* Orden de Entrega */}
                    <div className="space-y-2">
                        <Label htmlFor="orden" className="text-gray-700 dark:text-gray-300">
                            Orden de Entrega
                        </Label>
                        <Input
                            id="orden"
                            type="number"
                            min="0"
                            value={form.orden_entrega ?? ""}
                            onChange={(e) =>
                                setForm({ ...form, orden_entrega: parseInt(e.target.value) || null })
                            }
                            placeholder="Opcional"
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    {/* Sección */}
                    <div className="space-y-2">
                        <Label htmlFor="seccion" className="text-gray-700 dark:text-gray-300">
                            Sección
                        </Label>
                        <select
                            id="seccion"
                            value={form.seccion}
                            onChange={(e) => setForm({ ...form, seccion: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value="">-- Ninguna --</option>
                            {secciones.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
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
                            {submitting ? "Guardando..." : editingItem ? "Actualizar" : "Crear"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}