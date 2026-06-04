"use client";

import { useState, useEffect } from "react";
import { useDetallesCarga } from "@/hooks/useDetallesCarga";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { DetalleCarga, CreateDetalleCargaDto } from "@/types/detalleCarga";
import { fetchWithAuth } from "@/lib/api-client";

interface DetalleCargaModalProps {
    isOpen: boolean;
    onClose: () => void;
    operacionId: number;
    editingDetalle?: DetalleCarga | null;
    onSaved: () => void;
}

export function DetalleCargaModal({
    isOpen,
    onClose,
    operacionId,
    editingDetalle,
    onSaved,
}: DetalleCargaModalProps) {
    const { createDetalle, updateDetalle } = useDetallesCarga(operacionId);
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [clientes, setClientes] = useState<{ id_cliente: number; nombres: string; apellidos?: string }[]>([]);
    const [frutas, setFrutas] = useState<{ id_fruta: number; nombre: string }[]>([]);
    const [variedades, setVariedades] = useState<{ id_variedad: number; nombre: string; id_fruta: number }[]>([]);
    const [tiposJaba, setTiposJaba] = useState<{ id_tipo_jaba: number; nombre: string }[]>([]);
    const [filteredVariedades, setFilteredVariedades] = useState<typeof variedades>([]);

    const [form, setForm] = useState<CreateDetalleCargaDto>({
        id_cliente_emisor: 0,
        id_fruta: 0,
        id_variedad: null,
        id_tipo_jaba: 0,
        cantidad_jabas: 1,
        es_reparto: false,
        instruccion_reparto: "",
        observaciones: "",
        requiere_retorno_jabas: false,
    });

    // Cargar listas auxiliares cuando se abre el modal
    useEffect(() => {
        if (!isOpen) return;
        const loadData = async () => {
            try {
                const [clientesRes, frutasRes, variedadesRes, tiposRes] = await Promise.all([
                    fetchWithAuth<any[]>("clientes"),
                    fetchWithAuth<any[]>("frutas"),
                    fetchWithAuth<any[]>("variedades"),
                    fetchWithAuth<any[]>("tipos-jaba"),
                ]);
                setClientes(clientesRes || []);
                setFrutas(frutasRes || []);
                setVariedades(variedadesRes || []);
                setTiposJaba(tiposRes || []);
            } catch (error) {
                console.error("Error loading aux data", error);
                toast.error("No se pudieron cargar los datos");
            }
        };
        loadData();
    }, [isOpen, toast]);

    useEffect(() => {
        if (editingDetalle) {
            setForm({
                id_cliente_emisor: editingDetalle.id_cliente_emisor,
                id_fruta: editingDetalle.id_fruta,
                id_variedad: editingDetalle.id_variedad || null,
                id_tipo_jaba: editingDetalle.id_tipo_jaba,
                cantidad_jabas: editingDetalle.cantidad_jabas,
                es_reparto: editingDetalle.es_reparto,
                instruccion_reparto: editingDetalle.instruccion_reparto || "",
                observaciones: editingDetalle.observaciones || "",
                requiere_retorno_jabas: editingDetalle.requiere_retorno_jabas,
            });
        } else {
            setForm({
                id_cliente_emisor: 0,
                id_fruta: 0,
                id_variedad: null,
                id_tipo_jaba: 0,
                cantidad_jabas: 1,
                es_reparto: false,
                instruccion_reparto: "",
                observaciones: "",
                requiere_retorno_jabas: false,
            });
        }
    }, [editingDetalle, isOpen]);

    useEffect(() => {
        if (form.id_fruta) {
            setFilteredVariedades(variedades.filter(v => v.id_fruta === form.id_fruta));
        } else {
            setFilteredVariedades([]);
        }
    }, [form.id_fruta, variedades]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id_cliente_emisor === 0 || form.id_fruta === 0 || form.id_tipo_jaba === 0 || form.cantidad_jabas <= 0) {
            toast.error("Complete los campos obligatorios");
            return;
        }
        setSubmitting(true);
        try {
            if (editingDetalle) {
                await updateDetalle(editingDetalle.id_detalle_carga, form);
                toast.success("Detalle actualizado");
            } else {
                await createDetalle(form);
                toast.success("Detalle creado");
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingDetalle ? "Editar detalle" : "Nuevo detalle de carga"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos del detalle de carga
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cliente Emisor */}
                        <div className="space-y-2">
                            <Label htmlFor="cliente_emisor" className="text-gray-700 dark:text-gray-300">
                                Cliente Emisor *
                            </Label>
                            <select
                                id="cliente_emisor"
                                value={form.id_cliente_emisor}
                                onChange={(e) => setForm({ ...form, id_cliente_emisor: parseInt(e.target.value) })}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                            >
                                <option value={0}>Seleccione un cliente</option>
                                {clientes.map(c => (
                                    <option key={c.id_cliente} value={c.id_cliente}>
                                        {c.nombres} {c.apellidos || ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fruta */}
                        <div className="space-y-2">
                            <Label htmlFor="fruta" className="text-gray-700 dark:text-gray-300">
                                Fruta *
                            </Label>
                            <select
                                id="fruta"
                                value={form.id_fruta}
                                onChange={(e) => setForm({ ...form, id_fruta: parseInt(e.target.value), id_variedad: null })}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                            >
                                <option value={0}>Seleccione una fruta</option>
                                {frutas.map(f => (
                                    <option key={f.id_fruta} value={f.id_fruta}>{f.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Variedad (opcional) */}
                        <div className="space-y-2">
                            <Label htmlFor="variedad" className="text-gray-700 dark:text-gray-300">
                                Variedad (opcional)
                            </Label>
                            <select
                                id="variedad"
                                value={form.id_variedad ?? 0}
                                onChange={(e) => setForm({ ...form, id_variedad: parseInt(e.target.value) || null })}
                                disabled={!form.id_fruta}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700 dark:focus:ring-brand-800"
                            >
                                <option value={0}>-- Ninguna --</option>
                                {filteredVariedades.map(v => (
                                    <option key={v.id_variedad} value={v.id_variedad}>{v.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Jaba */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo_jaba" className="text-gray-700 dark:text-gray-300">
                                Tipo de Jaba *
                            </Label>
                            <select
                                id="tipo_jaba"
                                value={form.id_tipo_jaba}
                                onChange={(e) => setForm({ ...form, id_tipo_jaba: parseInt(e.target.value) })}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                            >
                                <option value={0}>Seleccione un tipo de jaba</option>
                                {tiposJaba.map(t => (
                                    <option key={t.id_tipo_jaba} value={t.id_tipo_jaba}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cantidad de Jabas */}
                        <div className="space-y-2">
                            <Label htmlFor="cantidad" className="text-gray-700 dark:text-gray-300">
                                Cantidad de Jabas *
                            </Label>
                            <Input
                                id="cantidad"
                                type="number"
                                min="1"
                                value={String(form.cantidad_jabas)}
                                onChange={(e) => setForm({ ...form, cantidad_jabas: parseInt(e.target.value) || 1 })}
                                required
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={form.es_reparto}
                                    onChange={(e) => setForm({ ...form, es_reparto: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                Requiere reparto
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={form.requiere_retorno_jabas}
                                    onChange={(e) => setForm({ ...form, requiere_retorno_jabas: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                Requiere retorno de jabas
                            </label>
                        </div>

                        {/* Instrucciones de reparto */}
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="instrucciones" className="text-gray-700 dark:text-gray-300">
                                Instrucciones de reparto
                            </Label>
                            <Input
                                id="instrucciones"
                                value={form.instruccion_reparto || ""}
                                onChange={(e) => setForm({ ...form, instruccion_reparto: e.target.value })}
                                placeholder="Opcional"
                                className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        {/* Observaciones */}
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="observaciones" className="text-gray-700 dark:text-gray-300">
                                Observaciones
                            </Label>
                            <textarea
                                id="observaciones"
                                rows={3}
                                value={form.observaciones || ""}
                                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                placeholder="Observaciones adicionales"
                            />
                        </div>
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
                            {submitting ? "Guardando..." : (editingDetalle ? "Actualizar" : "Crear")}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}