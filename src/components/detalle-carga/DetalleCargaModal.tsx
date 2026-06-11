"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDetallesCarga } from "@/hooks/useDetallesCarga";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { DetalleCarga, CreateDetalleCargaDto } from "@/types/detalleCarga";
import { fetchWithAuth } from "@/lib/api-client";

interface Cliente {
    id_cliente: number;
    nombres: string;
    apellidos?: string;
    cliente_sede?: { tipo_relacion: string }[];
}

interface Puesto {
    id_puesto: number;
    numero_puesto: string;
    referencia?: string;
}

interface Seccion {
    id_seccion: number;
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
    const [loadingData, setLoadingData] = useState(true);
    const dataLoadedRef = useRef(false);

    // Datos maestros
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [frutas, setFrutas] = useState<{ id_fruta: number; nombre: string }[]>([]);
    const [variedades, setVariedades] = useState<{ id_variedad: number; nombre: string; id_fruta: number }[]>([]);
    const [tiposJaba, setTiposJaba] = useState<{ id_tipo_jaba: number; nombre: string }[]>([]);
    const [filteredVariedades, setFilteredVariedades] = useState<typeof variedades>([]);

    // Datos para entrega manual
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [secciones, setSecciones] = useState<Seccion[]>([]);
    const [loadingPuestos, setLoadingPuestos] = useState(false);
    const [loadingSecciones, setLoadingSecciones] = useState(false);

    const [form, setForm] = useState<CreateDetalleCargaDto & {
        id_cliente_receptor?: number | null;
        id_puesto?: number | null;
        id_seccion?: number | null;
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

    // 1. Carga de datos maestros (una sola vez)
    useEffect(() => {
        if (!isOpen) return;
        if (dataLoadedRef.current) {
            setLoadingData(false);
            return;
        }
        let mounted = true;
        setLoadingData(true);

        const loadData = async () => {
            const extractArray = (resp: any): any[] => {
                if (Array.isArray(resp)) return resp;
                if (resp && typeof resp === "object" && Array.isArray(resp.data)) return resp.data;
                return [];
            };

            try {
                // Clientes (endpoint sin paginación)
                const clientesResp = await fetchWithAuth<any>("clientes/all");
                setClientes(extractArray(clientesResp));

                // Frutas
                const frutasResp = await fetchWithAuth<any>("frutas");
                setFrutas(extractArray(frutasResp));

                // Variedades
                const variedadesResp = await fetchWithAuth<any>("variedades");
                setVariedades(extractArray(variedadesResp));

                // Tipos de jaba
                const tiposResp = await fetchWithAuth<any>("tipos-jaba");
                setTiposJaba(extractArray(tiposResp));

                dataLoadedRef.current = true;
            } catch (err: any) {
                console.error("Error cargando datos maestros:", err);
                toast.error("No se pudieron cargar todos los datos. Recargue la página.");
            } finally {
                if (mounted) setLoadingData(false);
            }
        };
        loadData();
        return () => { mounted = false; };
    }, [isOpen]);

    // 2. Resetear formulario al editar
    useEffect(() => {
        if (!isOpen) return;
        if (editingDetalle) {
            setForm({
                id_cliente_emisor: editingDetalle.id_cliente_emisor,
                id_cliente_receptor: (editingDetalle as any).id_cliente_receptor ?? null,
                id_fruta: editingDetalle.id_fruta,
                id_variedad: editingDetalle.id_variedad || null,
                id_tipo_jaba: editingDetalle.id_tipo_jaba,
                cantidad_jabas: editingDetalle.cantidad_jabas,
                es_reparto: editingDetalle.es_reparto ?? true,
                instruccion_reparto: editingDetalle.instruccion_reparto || "",
                observaciones: editingDetalle.observaciones || "",
                requiere_retorno_jabas: editingDetalle.requiere_retorno_jabas ?? true,
                id_puesto: (editingDetalle as any).id_puesto ?? null,
                id_seccion: (editingDetalle as any).id_seccion ?? null,
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

    // 3. Filtrar variedades según fruta
    useEffect(() => {
        if (form.id_fruta && variedades.length) {
            setFilteredVariedades(variedades.filter(v => v.id_fruta === form.id_fruta));
        } else {
            setFilteredVariedades([]);
        }
    }, [form.id_fruta, variedades]);

    // 4. Cargar puestos del cliente receptor (solo si NO es reparto)
    useEffect(() => {
        const loadPuestos = async () => {
            if (form.es_reparto || !form.id_cliente_receptor) {
                setPuestos([]);
                setForm(prev => ({ ...prev, id_puesto: null, id_seccion: null }));
                return;
            }
            setLoadingPuestos(true);
            try {
                console.log("Cargando puestos para cliente:", form.id_cliente_receptor);
                const data = await fetchWithAuth<any[]>(`clientes/${form.id_cliente_receptor}/puestos`);
                console.log("Respuesta puestos:", data);
                // Extraer los puestos reales (anidados en .puestos)
                const puestosExtraidos = data
                    .map(item => item.puestos)
                    .filter(p => p && p.id_puesto);
                console.log("Puestos extraídos:", puestosExtraidos);
                setPuestos(puestosExtraidos);
                setForm(prev => ({ ...prev, id_puesto: null, id_seccion: null }));
            } catch (error: any) {
                console.error("Error cargando puestos:", error);
                toast.error(`No se pudieron cargar los puestos: ${error.message || "Error de red"}`);
            } finally {
                setLoadingPuestos(false);
            }
        };
        loadPuestos();
    }, [form.es_reparto, form.id_cliente_receptor]);

    // 5. Cargar secciones del puesto seleccionado
    useEffect(() => {
        const loadSecciones = async () => {
            if (form.es_reparto || !form.id_puesto) {
                setSecciones([]);
                setForm(prev => ({ ...prev, id_seccion: null }));
                return;
            }
            setLoadingSecciones(true);
            try {
                const data = await fetchWithAuth<Seccion[]>(`puestos/${form.id_puesto}/secciones`);
                console.log("Secciones cargadas:", data);
                setSecciones(data || []);
                setForm(prev => ({ ...prev, id_seccion: null }));
            } catch (error: any) {
                console.error("Error cargando secciones:", error);
                toast.error(`No se pudieron cargar las secciones: ${error.message || "Error de red"}`);
            } finally {
                setLoadingSecciones(false);
            }
        };
        loadSecciones();
    }, [form.es_reparto, form.id_puesto]);

    // 6. Limpiar campos cuando se activa/desactiva reparto
    useEffect(() => {
        if (form.es_reparto) {
            setPuestos([]);
            setSecciones([]);
            setForm(prev => ({ ...prev, id_cliente_receptor: null, id_puesto: null, id_seccion: null }));
        }
    }, [form.es_reparto]);

    // Filtros de clientes
    const isClienteEmisor = (cliente: Cliente) =>
        cliente.cliente_sede?.some(rel => rel.tipo_relacion === "emisor" || rel.tipo_relacion === "ambos") ?? false;
    const isClienteReceptor = (cliente: Cliente) =>
        cliente.cliente_sede?.some(rel => rel.tipo_relacion === "receptor" || rel.tipo_relacion === "ambos") ?? false;

    const clientesEmisores = useMemo(() => clientes.filter(isClienteEmisor), [clientes]);
    const clientesReceptores = useMemo(() => clientes.filter(isClienteReceptor), [clientes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validaciones
        if (form.id_cliente_emisor === 0 || form.id_fruta === 0 || form.id_tipo_jaba === 0 || form.cantidad_jabas <= 0) {
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {editingDetalle ? "Editar detalle" : "Nuevo detalle de carga"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete los datos del detalle de carga
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {loadingData ? (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            Cargando datos necesarios...
                        </div>
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
                                                disabled={loadingPuestos || !form.id_cliente_receptor}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700 dark:focus:ring-brand-800"
                                            >
                                                <option value={0}>
                                                    {loadingPuestos ? "Cargando puestos..." : "Seleccione un puesto"}
                                                </option>
                                                {puestos.map(p => (
                                                    <option key={p.id_puesto} value={p.id_puesto}>
                                                        {p.numero_puesto} {p.referencia ? `(${p.referencia})` : ""}
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
                                                value={form.id_seccion ?? 0}
                                                onChange={(e) => setForm({ ...form, id_seccion: parseInt(e.target.value) || null })}
                                                disabled={loadingSecciones || !form.id_puesto}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700 dark:focus:ring-brand-800"
                                            >
                                                <option value={0}>
                                                    {loadingSecciones ? "Cargando secciones..." : "Seleccione una sección"}
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
                                    {submitting ? "Guardando..." : editingDetalle ? "Actualizar" : "Crear"}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </Modal>
    );
}