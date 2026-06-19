// app/dashboard/operaciones-carga/[id]/detalles/nuevo/page.tsx
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Stepper } from '@/components/ui/Stepper';
import { useCreacionCargaStore } from '@/stores/creacionCargaStore';

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
    seccion?: string | null;
    key: string;
}

interface NuevoDetalleResponse {
    id_detalle_carga: number;
}

export default function NuevoDetallePage() {
    const { id: operacionId } = useParams();
    const router = useRouter();
    const toast = useToast();
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const dataLoadedRef = useRef(false);
    const { setCurrentStep } = useCreacionCargaStore();

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [frutas, setFrutas] = useState<{ id_fruta: number; nombre: string }[]>([]);
    const [variedades, setVariedades] = useState<{ id_variedad: number; nombre: string; id_fruta: number }[]>([]);
    const [tiposJaba, setTiposJaba] = useState<{ id_tipo_jaba: number; nombre: string }[]>([]);
    const [filteredVariedades, setFilteredVariedades] = useState<typeof variedades>([]);
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [loadingPuestos, setLoadingPuestos] = useState(false);

    const [form, setForm] = useState<any>({
        id_cliente_emisor: 0,
        id_cliente_receptor: null,
        id_fruta: 0,
        id_variedad: null,
        id_tipo_jaba: 0,
        cantidad_jabas: 1,
        es_reparto: true,
        instruccion_reparto: '',
        observaciones: '',
        requiere_retorno_jabas: true,
        id_puesto: null,
        id_seccion: null,
    });

    useEffect(() => {
        setCurrentStep(2);
    }, [setCurrentStep]);

    useEffect(() => {
        if (dataLoadedRef.current) { setLoadingData(false); return; }
        let mounted = true;
        setLoadingData(true);
        const loadData = async () => {
            const extract = (resp: any) => Array.isArray(resp) ? resp : (resp?.data || []);
            try {
                const [clientesResp, frutasResp, variedadesResp, tiposResp] = await Promise.all([
                    fetchWithAuth('clientes/all'),
                    fetchWithAuth('frutas'),
                    fetchWithAuth('variedades'),
                    fetchWithAuth('tipos-jaba'),
                ]);
                if (!mounted) return;
                setClientes(extract(clientesResp));
                setFrutas(extract(frutasResp));
                setVariedades(extract(variedadesResp));
                setTiposJaba(extract(tiposResp));
                dataLoadedRef.current = true;
            } catch (err) { toast.error('Error cargando datos'); } finally { if (mounted) setLoadingData(false); }
        };
        loadData();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (form.id_fruta) setFilteredVariedades(variedades.filter(v => v.id_fruta === form.id_fruta));
        else setFilteredVariedades([]);
    }, [form.id_fruta, variedades]);

    useEffect(() => {
        if (form.es_reparto || !form.id_cliente_receptor) {
            setPuestos([]);
            setForm((prev: any) => ({ ...prev, id_puesto: null, id_seccion: null }));
            return;
        }
        const load = async () => {
            setLoadingPuestos(true);
            try {
                const data = await fetchWithAuth<any[]>(`clientes/${form.id_cliente_receptor}/puestos`);
                const puestosExt = data.map(item => ({
                    id_puesto: item.puestos.id_puesto,
                    numero_puesto: item.puestos.numero_puesto,
                    referencia: item.puestos.referencia,
                    seccion: item.seccion || null,
                    key: `${item.puestos.id_puesto}-${item.seccion || ''}`,
                }));
                setPuestos(puestosExt);
                setForm((prev: any) => ({ ...prev, id_puesto: null, id_seccion: null }));
            } catch (err) { toast.error('Error cargando puestos'); } finally { setLoadingPuestos(false); }
        };
        load();
    }, [form.es_reparto, form.id_cliente_receptor]);

    useEffect(() => {
        if (form.es_reparto) {
            setPuestos([]);
            setForm((prev: any) => ({ ...prev, id_cliente_receptor: null, id_puesto: null, id_seccion: null }));
        }
    }, [form.es_reparto]);

    const clientesEmisores = useMemo(() => clientes.filter(c => c.cliente_sede?.some(r => r.tipo_relacion === 'emisor' || r.tipo_relacion === 'ambos')), [clientes]);
    const clientesReceptores = useMemo(() => clientes.filter(c => c.cliente_sede?.some(r => r.tipo_relacion === 'receptor' || r.tipo_relacion === 'ambos')), [clientes]);

    const handlePuestoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedKey = e.target.value;
        if (!selectedKey) {
            setForm({ ...form, id_puesto: null, id_seccion: null });
            return;
        }
        const [idPuestoStr, seccionVal] = selectedKey.split('-');
        const idPuesto = Number(idPuestoStr);
        const seccion = seccionVal === 'null' ? null : seccionVal;
        setForm({
            ...form,
            id_puesto: idPuesto || null,
            id_seccion: seccion,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id_cliente_emisor === 0 || form.id_fruta === 0 || form.id_tipo_jaba === 0 || form.cantidad_jabas <= 0) {
            toast.error('Complete los campos obligatorios');
            return;
        }
        if (!form.es_reparto && (!form.id_cliente_receptor || !form.id_puesto)) {
            toast.error('Seleccione cliente receptor y puesto para entrega manual');
            return;
        }
        setSubmitting(true);
        try {
            const payload = { ...form };
            if (form.es_reparto) {
                delete payload.id_cliente_receptor;
                delete payload.id_puesto;
                delete payload.id_seccion;
            }
            const newDetalle = await fetchWithAuth<NuevoDetalleResponse>(`operaciones-carga/${operacionId}/detalles`, {
                method: 'POST',
                body: payload,
            });
            toast.success('Detalle creado');
            if (form.es_reparto) {
                router.push(`/dashboard/operaciones-carga/${operacionId}/detalles/${newDetalle.id_detalle_carga}/calidades`);
            } else {
                router.push(`/dashboard/operaciones-carga/${operacionId}`);
            }
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="p-6 text-center">Cargando datos...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Stepper />
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nuevo detalle de carga</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Complete los datos del detalle para agregarlo a la operación.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección: Datos principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Cliente Emisor <span className="text-red-500">*</span></Label>
                            <select
                                value={form.id_cliente_emisor}
                                onChange={e => setForm({ ...form, id_cliente_emisor: Number(e.target.value) })}
                                required
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value={0}>Seleccione un cliente</option>
                                {clientesEmisores.map(c => (
                                    <option key={c.id_cliente} value={c.id_cliente}>
                                        {c.nombres} {c.apellidos || ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Fruta <span className="text-red-500">*</span></Label>
                            <select
                                value={form.id_fruta}
                                onChange={e => setForm({ ...form, id_fruta: Number(e.target.value), id_variedad: null })}
                                required
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value={0}>Seleccione una fruta</option>
                                {frutas.map(f => (
                                    <option key={f.id_fruta} value={f.id_fruta}>{f.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Variedad</Label>
                            <select
                                value={form.id_variedad ?? 0}
                                onChange={e => setForm({ ...form, id_variedad: Number(e.target.value) || null })}
                                disabled={!form.id_fruta}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value={0}>-- Ninguna --</option>
                                {filteredVariedades.map(v => (
                                    <option key={v.id_variedad} value={v.id_variedad}>{v.nombre}</option>
                                ))}
                            </select>
                            {!form.id_fruta && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Seleccione una fruta primero</p>
                            )}
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Tipo de Jaba <span className="text-red-500">*</span></Label>
                            <select
                                value={form.id_tipo_jaba}
                                onChange={e => setForm({ ...form, id_tipo_jaba: Number(e.target.value) })}
                                required
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value={0}>Seleccione un tipo</option>
                                {tiposJaba.map(t => (
                                    <option key={t.id_tipo_jaba} value={t.id_tipo_jaba}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Cantidad de Jabas <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                min="1"
                                value={form.cantidad_jabas}
                                onChange={e => setForm({ ...form, cantidad_jabas: Number(e.target.value) })}
                                required
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col justify-center gap-2">
                            <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.es_reparto}
                                    onChange={e => setForm({ ...form, es_reparto: e.target.checked })}
                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                />
                                <span className="text-sm font-medium">Requiere reparto</span>
                            </label>
                            <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.requiere_retorno_jabas}
                                    onChange={e => setForm({ ...form, requiere_retorno_jabas: e.target.checked })}
                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                />
                                <span className="text-sm font-medium">Requiere retorno de jabas</span>
                            </label>
                        </div>
                    </div>

                    {/* Sección condicional: Entrega manual */}
                    {!form.es_reparto && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-5 space-y-5">
                            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Detalles de entrega manual</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Cliente Receptor <span className="text-red-500">*</span></Label>
                                    <select
                                        value={form.id_cliente_receptor ?? 0}
                                        onChange={e => setForm({ ...form, id_cliente_receptor: Number(e.target.value) || null, id_puesto: null, id_seccion: null })}
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value={0}>Seleccione un cliente</option>
                                        {clientesReceptores.map(c => (
                                            <option key={c.id_cliente} value={c.id_cliente}>
                                                {c.nombres} {c.apellidos || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Puesto <span className="text-red-500">*</span></Label>
                                    <select
                                        value={form.id_puesto ? `${form.id_puesto}-${form.id_seccion || ''}` : ''}
                                        onChange={handlePuestoChange}
                                        required
                                        disabled={loadingPuestos || !form.id_cliente_receptor}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">
                                            {loadingPuestos ? 'Cargando puestos...' : 'Seleccione un puesto'}
                                        </option>
                                        {puestos.map(p => (
                                            <option key={p.key} value={p.key}>
                                                {p.numero_puesto} {p.referencia ? `(${p.referencia})` : ''} - Sección {p.seccion || 'Ninguna'}
                                            </option>
                                        ))}
                                    </select>
                                    {!form.id_cliente_receptor && (
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Seleccione un cliente receptor primero</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Campos adicionales */}
                    <div className="space-y-5">
                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Instrucciones de reparto</Label>
                            <Input
                                value={form.instruccion_reparto}
                                onChange={e => setForm({ ...form, instruccion_reparto: e.target.value })}
                                placeholder="Instrucciones para el repartidor (opcional)"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Observaciones</Label>
                            <textarea
                                rows={3}
                                value={form.observaciones}
                                onChange={e => setForm({ ...form, observaciones: e.target.value })}
                                placeholder="Comentarios adicionales (opcional)"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Guardando...' : 'Crear detalle'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}