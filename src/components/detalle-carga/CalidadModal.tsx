"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { fetchWithAuth } from "@/lib/api-client";
import type { DetalleCalidad, CreateDetalleCalidadDto } from "@/types/detalleCarga";

interface CalidadModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCalidad?: DetalleCalidad | null;
    onSave: (data: CreateDetalleCalidadDto) => Promise<void>;
    maxCantidad: number;
    currentTotal: number;
}

export function CalidadModal({
    isOpen,
    onClose,
    editingCalidad,
    onSave,
    maxCantidad,
    currentTotal,
}: CalidadModalProps) {
    const [calidades, setCalidades] = useState<{ id_calidad: number; nombre: string }[]>([]);
    const [form, setForm] = useState<CreateDetalleCalidadDto>({
        id_calidad: 0,
        cantidad: 1,
        precio_unitario: null,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        fetchWithAuth<{ id_calidad: number; nombre: string }[]>("calidades")
            .then((data) => setCalidades(data || []))
            .catch(console.error);
    }, [isOpen]);

    useEffect(() => {
        if (editingCalidad) {
            setForm({
                id_calidad: editingCalidad.id_calidad,
                cantidad: editingCalidad.cantidad,
                precio_unitario: editingCalidad.precio_unitario ?? null,
            });
        } else {
            setForm({ id_calidad: 0, cantidad: 1, precio_unitario: null });
        }
    }, [editingCalidad, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id_calidad === 0 || form.cantidad <= 0) {
            alert("Complete los campos obligatorios");
            return;
        }

        let nuevaCantidad = form.cantidad;
        let totalActual = currentTotal;
        if (editingCalidad) {
            totalActual = currentTotal - editingCalidad.cantidad;
        }
        if (totalActual + nuevaCantidad > maxCantidad) {
            const disponible = maxCantidad - totalActual;
            alert(
                `La suma de calidades no puede exceder ${maxCantidad} jabas. Quedan disponibles ${disponible}.`
            );
            return;
        }

        setSubmitting(true);
        try {
            await onSave(form);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar la calidad");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6 dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingCalidad ? "Editar calidad" : "Nueva calidad"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos de la calidad
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="calidad" className="text-gray-700 dark:text-gray-300">
                            Calidad *
                        </Label>
                        <select
                            id="calidad"
                            value={form.id_calidad}
                            onChange={(e) => setForm({ ...form, id_calidad: parseInt(e.target.value) })}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                        >
                            <option value={0}>Seleccione una calidad</option>
                            {calidades.map((c) => (
                                <option key={c.id_calidad} value={c.id_calidad}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cantidad" className="text-gray-700 dark:text-gray-300">
                            Cantidad *
                        </Label>
                        <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            value={String(form.cantidad)}
                            onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })}
                            required
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="precio" className="text-gray-700 dark:text-gray-300">
                            Precio Unitario (opcional)
                        </Label>
                        <Input
                            id="precio"
                            type="number"
                            step={0.01}
                            min="0"
                            value={form.precio_unitario !== null ? String(form.precio_unitario) : ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    precio_unitario: e.target.value ? parseFloat(e.target.value) : null,
                                })
                            }
                            placeholder="S/ 0.00"
                            className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="dark:bg-brand-600 dark:hover:bg-brand-700"
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}