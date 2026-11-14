"use client";

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';

import { useState, useEffect } from "react";
import { useDetallesCarga } from "@/hooks/useDetallesCarga";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { DetalleCarga, CreateDetalleCargaDto } from "@/types/detalleCarga";
import { useOpcionesFlujo } from '@/hooks/useOpcionesFlujo';

interface Cliente {
    id_cliente: number;
    nombres: string;
    apellidos?: string;
    cliente_distrito?: { tipo_relacion: string }[];
}

interface Puesto {
    id_puesto: number;
    codigo_puesto: string;
    referencia?: string;
}

interface Seccion {
    id_seccion: string;
    nombre_seccion: string;
}

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
    const [hasLoadedOptions, setHasLoadedOptions] = useState(false);
    const [optionsRetry, setOptionsRetry] = useState(0);
    useEffect(() => { if (!isOpen) setHasLoadedOptions(false); }, [isOpen]);

    // Datos maestros
    const [clientesEmisores, setClientesEmisores] = useState<Cliente[]>([]);
    const [clientesReceptores, setClientesReceptores] = useState<Cliente[]>([]);
    const [frutas, setFrutas] = useState<{ id_fruta: number; nombre: string }[]>([]);
    const [tiposJaba, setTiposJaba] = useState<{ id_tipo_jaba: number; nombre: string }[]>([]);
    const [filteredVariedades, setFilteredVariedades] = useState<{ id_variedad: number; nombre: string }[]>([]);

    // Datos para entrega manual
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [secciones, setSecciones] = useState<Seccion[]>([]);



    const [form, setForm] = useState<CreateDetalleCargaDto & {
        id_cliente_receptor?: number | null;
        id_puesto?: number | null;
        id_seccion?: string | null;
    }>({
        id_cliente_emisor: 0,
        id_cliente_receptor: null,
        id_fruta: 0,
        id_variedad: null,
        id_tipo_jaba: 0,
        cantidad_jabas: 1,
        es_reparto: true,
        instruccion_reparto: "",
        observaciones: "",
        requiere_retorno_jabas: true,
        id_puesto: null,
        id_seccion: null,
    });

    const { data: opciones, loading: loadingData, error: opcionesError } = useOpcionesFlujo<{
        emisores: Cliente[]; receptores: Cliente[]; frutas: typeof frutas; variedades: typeof filteredVariedades;
        tiposJaba: typeof tiposJaba; puestos: Puesto[]; secciones: Seccion[];
    }>('carga', { operacion: operacionId, fruta: form.id_fruta, cliente: form.es_reparto ? null : form.id_cliente_receptor, puesto: form.es_reparto ? null : form.id_puesto, buscar: String(optionsRetry) }, isOpen);
    useEffect(() => {
        if (!opciones) return;
        setHasLoadedOptions(true);
        setClientesEmisores(opciones.emisores); setClientesReceptores(opciones.receptores);
        setFrutas(opciones.frutas); setFilteredVariedades(opciones.variedades); setTiposJaba(opciones.tiposJaba);
        setPuestos(opciones.puestos); setSecciones(opciones.secciones);
        setForm(prev => ({...prev,
            id_cliente_emisor: opciones.emisores.some(x => x.id_cliente === prev.id_cliente_emisor) ? prev.id_cliente_emisor : 0,
            id_fruta: opciones.frutas.some(x => x.id_fruta === prev.id_fruta) ? prev.id_fruta : 0,
            id_tipo_jaba: opciones.tiposJaba.some(x => x.id_tipo_jaba === prev.id_tipo_jaba) ? prev.id_tipo_jaba : 0,
            id_variedad: opciones.variedades.some(x => x.id_variedad === prev.id_variedad) ? prev.id_variedad : null,
            id_cliente_receptor: opciones.receptores.some(x => x.id_cliente === prev.id_cliente_receptor) ? prev.id_cliente_receptor : null,
            id_puesto: opciones.puestos.some(x => x.id_puesto === prev.id_puesto) ? prev.id_puesto : null,
            id_seccion: opciones.secciones.some(x => x.id_seccion === prev.id_seccion) ? prev.id_seccion : null,
        }));
    }, [opciones]);
    useEffect(() => { if (opcionesError) toast.error(opcionesError); }, [opcionesError, toast]);

    // 2. Resetear formulario al editar
    useEffect(() => {
        if (!isOpen) return;
        if (editingDetalle) {
            setForm({
                orden_carga: editingDetalle.orden_carga,
                id_cliente_emisor: editingDetalle.id_cliente_emisor,
                id_cliente_receptor: (editingDetalle as any).items_reparto?.[0]?.id_cliente_receptor ?? (editingDetalle as any).id_cliente_receptor ?? null,
                id_fruta: editingDetalle.id_fruta,
                id_variedad: editingDetalle.id_variedad || null,
                id_tipo_jaba: editingDetalle.id_tipo_jaba,
                cantidad_jabas: editingDetalle.cantidad_jabas,
                es_reparto: editingDetalle.es_reparto ?? true,
                instruccion_reparto: editingDetalle.instruccion_reparto || "",
                observaciones: editingDetalle.observaciones || "",
                requiere_retorno_jabas: editingDetalle.requiere_retorno_jabas ?? true,
                id_puesto: (editingDetalle as any).items_reparto?.[0]?.id_puesto ?? (editingDetalle as any).id_puesto ?? null,
                id_seccion: (editingDetalle as any).items_reparto?.[0]?.seccion ?? (editingDetalle as any).id_seccion ?? null,
            });
        } else {
            setForm({
                id_cliente_emisor: 0,
                id_cliente_receptor: null,
                id_fruta: 0,
                id_variedad: null,
                id_tipo_jaba: 0,
                cantidad_jabas: 1,
                es_reparto: true,
                instruccion_reparto: "",
                observaciones: "",
                requiere_retorno_jabas: true,
                id_puesto: null,
                id_seccion: null,
            });
        }
    }, [isOpen, editingDetalle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting || loadingData || opcionesError) return;
        // Validaciones
        if (form.id_cliente_emisor === 0 || form.id_fruta === 0 || form.id_tipo_jaba === 0 || form.cantidad_jabas <= 0 || !Number.isInteger(form.cantidad_jabas)) {
            toast.error("Complete los campos obligatorios (Cliente Emisor, Fruta, Tipo Jaba, Cantidad)");
            return;
        }
        if (!form.es_reparto) {
            if (!form.id_cliente_receptor) {
                toast.error("Seleccione un cliente receptor para la entrega manual");
                return;
            }
            if (!form.id_puesto) {
                toast.error("Seleccione un puesto para la entrega manual");
                return;
            }
        }
        setSubmitting(true);
        try {
            const payload = { ...form };
            if (form.es_reparto) {
                delete payload.id_cliente_receptor;
                delete payload.id_puesto;
                delete payload.id_seccion;
            }
            if (editingDetalle) {
                await updateDetalle(editingDetalle.id_detalle_carga, payload);
                toast.success("Detalle actualizado");
            } else {
                await createDetalle(payload);
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

    // JSX (mismo que antes, pero con los estados correctos)
    return (
        <Modal isOpen={isOpen} onClose={() => { if (!submitting) onClose(); }} className="mx-4 max-h-[90dvh] max-w-2xl overflow-y-auto" ariaLabel={editingDetalle ? "Editar producto" : "Agregar producto"}>
            <div className="p-6 dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingDetalle ? "Editar producto" : "Agregar producto a la carga"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Indica el producto, las jabas y cómo se entregará. Al guardar volverás a esta carga.
                </p>

                <div role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-gray-500 dark:text-gray-400">
                    {loadingData && hasLoadedOptions ? 'Actualizando opciones disponibles…' : ''}
                </div>
                {opcionesError && (
                    <div role="alert" className="space-y-2 text-sm text-red-600">
                        <p>No se pudieron actualizar las opciones.</p>
                        <Button type="button" variant="outline" onClick={() => setOptionsRetry(n => n + 1)}>Reintentar carga</Button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {loadingData && !hasLoadedOptions ? (
                        <OperationSkeleton variant="compact" heading={false} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        <option value={0}>Seleccione un cliente emisor</option>
                                        {clientesEmisores.map(c => (
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

                                {/* Variedad */}
                                <div className="space-y-2">
                                    <Label htmlFor="variedad" className="text-gray-700 dark:text-gray-300">
                                        Variedad (opcional)
                                    </Label>
                                    <select
                                        id="variedad"
                                        value={form.id_variedad ?? 0}
                                        onChange={(e) => setForm({ ...form, id_variedad: parseInt(e.target.value) || null })}
                                        disabled={loadingData || !!opcionesError || !form.id_fruta}
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
                                            onChange={(e) => setForm({ ...form, es_reparto: e.target.checked, id_cliente_receptor: null, id_puesto: null, id_seccion: null })}
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

                                {/* Campos de entrega manual (solo si NO hay reparto) */}
                                {!form.es_reparto && (
                                    <>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="cliente_receptor" className="text-gray-700 dark:text-gray-300">
                                                Cliente Receptor *
                                            </Label>
                                            <select
                                                id="cliente_receptor"
                                                value={form.id_cliente_receptor ?? 0}
                                                onChange={(e) => setForm({ ...form, id_cliente_receptor: parseInt(e.target.value) || null, id_puesto: null, id_seccion: null })}
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-brand-800"
                                            >
                                                <option value={0}>Seleccione un cliente receptor</option>
                                                {clientesReceptores.map(c => (
                                                    <option key={c.id_cliente} value={c.id_cliente}>
                                                        {c.nombres} {c.apellidos || ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="puesto" className="text-gray-700 dark:text-gray-300">
                                                Puesto *
                                            </Label>
                                            <select
                                                id="puesto"
                                                value={form.id_puesto ?? 0}
                                                onChange={(e) => setForm({ ...form, id_puesto: parseInt(e.target.value) || null, id_seccion: null })}
                                                required
                                                disabled={loadingData || !!opcionesError || !form.id_cliente_receptor}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700 dark:focus:ring-brand-800"
                                            >
                                                <option value={0}>
                                                    {loadingData ? "Cargando puestos..." : "Seleccione un puesto"}
                                                </option>
                                                {puestos.map(p => (
                                                    <option key={p.id_puesto} value={p.id_puesto}>
                                                        {p.codigo_puesto} {p.referencia ? `(${p.referencia})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="seccion" className="text-gray-700 dark:text-gray-300">
                                                Sección (opcional)
                                            </Label>
                                            <select
                                                id="seccion"
                                                value={form.id_seccion ?? ''}
                                                onChange={(e) => setForm({ ...form, id_seccion: e.target.value || null })}
                                                disabled={loadingData || !!opcionesError || !form.id_puesto}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700 dark:focus:ring-brand-800"
                                            >
                                                <option value="">
                                                    {loadingData ? "Cargando secciones..." : "Seleccione una sección"}
                                                </option>
                                                {secciones.map(s => (
                                                    <option key={s.id_seccion} value={s.id_seccion}>{s.nombre_seccion}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

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

                            <div className="max-w-32"><Label htmlFor="orden-carga">Orden</Label><Input id="orden-carga" type="number" min="1" step={1} value={form.orden_carga ?? ''} placeholder="Automático" onChange={e => setForm({ ...form, orden_carga: e.target.value ? Number(e.target.value) : undefined })} /></div>
                        <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={submitting}
                                    onClick={onClose}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting || loadingData || !!opcionesError}
                                    className="dark:bg-brand-600 dark:hover:bg-brand-700"
                                >
                                    {submitting ? "Guardando..." : editingDetalle ? "Guardar cambios" : "Agregar producto"}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </Modal>
    );
}