"use client";

import { useState, useEffect } from "react";
import { useEntregas } from "@/hooks/useEntregas";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { fetchWithAuth } from "@/lib/api-client";
import type { Entrega, CreateEntregaDto } from "@/types/entrega";

interface EntregaModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEntrega?: Entrega | null;
    onSaved: () => void;
}

export function EntregaModal({ isOpen, onClose, editingEntrega, onSaved }: EntregaModalProps) {
    const { createEntrega, updateEntrega } = useEntregas();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [guias, setGuias] = useState<{ id_guia: number; numero_guia: string }[]>([]);
    const [itemsReparto, setItemsReparto] = useState<{ id_item_reparto: number }[]>([]);
    const [usuarios, setUsuarios] = useState<{ id_usuario: number; nombres: string }[]>([]);

    const [form, setForm] = useState<CreateEntregaDto>({
        id_guia: 0,
        id_item_reparto: 0,
        id_entregador: null,
        fecha_entrega: new Date().toISOString().split("T")[0],
        hora_entrega: null,
        cantidad_entregada: 0,
        cantidad_rechazada: 0,
        estado_entrega: "pendiente",
        firma_recibido: false,
        nombre_recibe: null,
        observaciones: "",
    });

    useEffect(() => {
        if (!isOpen) return;
        const loadData = async () => {
            try {
                const [guiasRes, itemsRes, usuariosRes] = await Promise.all([
                    fetchWithAuth<any[]>("guias-operativas"),
                    fetchWithAuth<any[]>("items-reparto"),
                    fetchWithAuth<any[]>("usuarios"),
                ]);
                setGuias(guiasRes || []);
                setItemsReparto(itemsRes || []);
                setUsuarios(usuariosRes || []);
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar datos");
            }
        };
        loadData();
    }, [isOpen, toast]);

    useEffect(() => {
        if (editingEntrega) {
            setForm({
                id_guia: editingEntrega.id_guia,
                id_item_reparto: editingEntrega.id_item_reparto,
                id_entregador: editingEntrega.id_entregador,
                fecha_entrega: editingEntrega.fecha_entrega.split("T")[0],
                hora_entrega: editingEntrega.hora_entrega,
                cantidad_entregada: editingEntrega.cantidad_entregada,
                cantidad_rechazada: editingEntrega.cantidad_rechazada,
                estado_entrega: editingEntrega.estado_entrega,
                firma_recibido: editingEntrega.firma_recibido,
                nombre_recibe: editingEntrega.nombre_recibe,
                observaciones: editingEntrega.observaciones || "",
            });
        } else {
            setForm({
                id_guia: 0,
                id_item_reparto: 0,
                id_entregador: null,
                fecha_entrega: new Date().toISOString().split("T")[0],
                hora_entrega: null,
                cantidad_entregada: 0,
                cantidad_rechazada: 0,
                estado_entrega: "pendiente",
                firma_recibido: false,
                nombre_recibe: null,
                observaciones: "",
            });
        }
    }, [editingEntrega, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id_guia === 0 || form.id_item_reparto === 0 || form.cantidad_entregada < 0) {
            toast.error("Complete campos obligatorios (guía, item reparto, cantidad entregada)");
            return;
        }
        setSubmitting(true);
        try {
            if (editingEntrega) {
                await updateEntrega(editingEntrega.id_entrega, form);
                toast.success("Entrega actualizada");
            } else {
                await createEntrega(form);
                toast.success("Entrega registrada");
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
                    {editingEntrega ? "Editar entrega" : "Nueva entrega"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos de la entrega
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {/* Guía */}
                    <div className="space-y-2">
                        <Label htmlFor="guia" className="text-gray-700 dark:text-gray-300">
                            Guía *
                        </Label>
                        <select
                            id="guia"
                            value={form.id_guia}
                            onChange={(e) => setForm({ ...form, id_guia: parseInt(e.target.value) })}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value={0}>Seleccione una guía</option>
                            {guias.map((g) => (
                                <option key={g.id_guia} value={g.id_guia}>
                                    {g.numero_guia}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Item Reparto */}
                    <div className="space-y-2">
                        <Label htmlFor="item_reparto" className="text-gray-700 dark:text-gray-300">
                            Item Reparto *
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
                                    #{item.id_item_reparto}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Entregador */}
                    <div className="space-y-2">
                        <Label htmlFor="entregador" className="text-gray-700 dark:text-gray-300">
                            Entregador (opcional)
                        </Label>
                        <select
                            id="entregador"
                            value={form.id_entregador ?? 0}
                            onChange={(e) =>
                                setForm({ ...form, id_entregador: parseInt(e.target.value) || null })
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value={0}>-- Sin asignar --</option>
                            {usuarios.map((u) => (
                                <option key={u.id_usuario} value={u.id_usuario}>
                                    {u.nombres}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fecha_entrega" className="text-gray-700 dark:text-gray-300">
                                Fecha Entrega *
                            </Label>
                            <Input
                                id="fecha_entrega"
                                type="date"
                                value={form.fecha_entrega}
                                onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
                                required
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hora_entrega" className="text-gray-700 dark:text-gray-300">
                                Hora (opcional)
                            </Label>
                            <Input
                                id="hora_entrega"
                                type="time"
                                value={form.hora_entrega || ""}
                                onChange={(e) =>
                                    setForm({ ...form, hora_entrega: e.target.value || null })
                                }
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Cantidades */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cantidad_entregada" className="text-gray-700 dark:text-gray-300">
                                Cant. Entregada *
                            </Label>
                            <Input
                                id="cantidad_entregada"
                                type="number"
                                min="0"
                                value={String(form.cantidad_entregada)}
                                onChange={(e) =>
                                    setForm({ ...form, cantidad_entregada: parseInt(e.target.value) || 0 })
                                }
                                required
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cantidad_rechazada" className="text-gray-700 dark:text-gray-300">
                                Cant. Rechazada
                            </Label>
                            <Input
                                id="cantidad_rechazada"
                                type="number"
                                min="0"
                                value={String(form.cantidad_rechazada)}
                                onChange={(e) =>
                                    setForm({ ...form, cantidad_rechazada: parseInt(e.target.value) || 0 })
                                }
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Estado Entrega */}
                    <div className="space-y-2">
                        <Label htmlFor="estado_entrega" className="text-gray-700 dark:text-gray-300">
                            Estado Entrega *
                        </Label>
                        <select
                            id="estado_entrega"
                            value={form.estado_entrega}
                            onChange={(e) => setForm({ ...form, estado_entrega: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="entregado_parcial">Entregado Parcial</option>
                            <option value="entregado_total">Entregado Total</option>
                            <option value="rechazado">Rechazado</option>
                            <option value="observado">Observado</option>
                        </select>
                    </div>

                    {/* Firma */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={form.firma_recibido}
                                onChange={(e) => setForm({ ...form, firma_recibido: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            ¿Firma recibida?
                        </label>
                        {form.firma_recibido && (
                            <div className="mt-2">
                                <Input
                                    placeholder="Nombre de quien recibe"
                                    value={form.nombre_recibe || ""}
                                    onChange={(e) => setForm({ ...form, nombre_recibe: e.target.value })}
                                    className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        )}
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
                            {submitting ? "Guardando..." : editingEntrega ? "Actualizar" : "Registrar"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}