// app/dashboard/operaciones-carga/nueva/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { format } from 'date-fns';
import { useCreacionCargaStore } from '@/stores/creacionCargaStore';
import { Stepper } from '@/components/ui/Stepper';

interface Sede {
    id_sede: number;
    nombre: string;
    tipo_sede: 'origen' | 'destino' | 'ambos' | null;
}
interface Camion { id_camion: number; placa: string; }
interface Usuario { id_usuario: number; nombres: string; apellidos: string | null; usuarios_roles?: { roles_usuarios: { nombre: string } }[]; }

export default function NuevaOperacionPage() {
    const router = useRouter();
    const { setOperacion, setCurrentStep } = useCreacionCargaStore();
    const toast = useToast();

    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sedesOrigen, setSedesOrigen] = useState<Sede[]>([]);
    const [sedesDestino, setSedesDestino] = useState<Sede[]>([]);
    const [camiones, setCamiones] = useState<Camion[]>([]);
    const [encargados, setEncargados] = useState<Usuario[]>([]);
    const [repartidores, setRepartidores] = useState<Usuario[]>([]);
    const dataLoadedRef = useRef(false);

    const now = new Date();
    const defaultFecha = format(now, 'yyyy-MM-dd');
    const defaultHora = format(now, 'HH:mm');

    const [form, setForm] = useState({
        id_sede_origen: 0,
        id_sede_destino: null as number | null,
        id_camion: 0,
        id_encargado_carga: null as number | null,
        id_repartidor_asignado: null as number | null,
        fecha_carga: defaultFecha,
        hora_carga: defaultHora,
        estado: 'pendiente',
        observaciones: null as string | null,
    });

    interface NuevaOperacionResponse { id_operacion: number; }

    // Cargar datos
    useEffect(() => {
        if (dataLoadedRef.current) {
            setLoadingData(false);
            return;
        }
        let mounted = true;
        setLoadingData(true);
        const loadData = async () => {
            try {
                const [sedesRes, camionesRes, usuariosRes] = await Promise.all([
                    fetchWithAuth<Sede[]>('sedes'),
                    fetchWithAuth<Camion[]>('camiones'),
                    fetchWithAuth<Usuario[]>('usuarios'),
                ]);
                if (!mounted) return;
                const sedes = sedesRes || [];
                setSedesOrigen(sedes.filter(s => s.tipo_sede === 'origen' || s.tipo_sede === 'ambos'));
                setSedesDestino(sedes.filter(s => s.tipo_sede === 'destino' || s.tipo_sede === 'ambos'));
                setCamiones(camionesRes || []);
                const usuarios = usuariosRes || [];
                setEncargados(usuarios.filter(u => u.usuarios_roles?.some(r => r.roles_usuarios.nombre === 'encargado_carga')));
                setRepartidores(usuarios.filter(u => u.usuarios_roles?.some(r => r.roles_usuarios.nombre === 'repartidor')));
                dataLoadedRef.current = true;
            } catch (err) {
                console.error(err);
                toast.error('No se pudieron cargar los datos necesarios. Intente de nuevo.');
            } finally {
                if (mounted) setLoadingData(false);
            }
        };
        loadData();
        return () => { mounted = false; };
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id_sede_origen === 0 || form.id_camion === 0 || !form.fecha_carga) {
            toast.error('Por favor, complete los campos obligatorios (Sede origen, Camión y Fecha).');
            return;
        }
        setSubmitting(true);
        try {
            const nueva = await fetchWithAuth<NuevaOperacionResponse>('operaciones-carga', {
                method: 'POST',
                body: form,
            });
            toast.success('¡Operación creada con éxito! Redirigiendo...');
            setOperacion(nueva.id_operacion, form);
            setCurrentStep(2);
            router.push(`/dashboard/operaciones-carga/${nueva.id_operacion}`);
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar la operación. Verifique los datos.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando datos necesarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-5 space-y-5">
            {/* Cabecera */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Nueva operación de carga</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Complete los datos. Los campos con <span className="text-red-500">*</span> son obligatorios.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-sm"
                >
                    Cancelar
                </Button>
            </div>

            {/* Stepper */}
            <Stepper />

            {/* Formulario */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sede origen */}
                        <div className="space-y-1.5">
                            <Label htmlFor="sede_origen" className="text-sm font-medium">
                                Sede origen <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="sede_origen"
                                value={form.id_sede_origen}
                                onChange={e => setForm({ ...form, id_sede_origen: Number(e.target.value) })}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-900 dark:text-white"
                                required
                            >
                                <option value={0}>-- Seleccione --</option>
                                {sedesOrigen.map(s => (
                                    <option key={s.id_sede} value={s.id_sede}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sede destino */}
                        <div className="space-y-1.5">
                            <Label htmlFor="sede_destino" className="text-sm font-medium">
                                Sede destino <span className="text-gray-400 text-xs">(opcional)</span>
                            </Label>
                            <select
                                id="sede_destino"
                                value={form.id_sede_destino ?? 0}
                                onChange={e => setForm({ ...form, id_sede_destino: Number(e.target.value) || null })}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-900 dark:text-white"
                            >
                                <option value={0}>-- Seleccione (opcional) --</option>
                                {sedesDestino.map(s => (
                                    <option key={s.id_sede} value={s.id_sede}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Camión */}
                        <div className="space-y-1.5">
                            <Label htmlFor="camion" className="text-sm font-medium">
                                Camión <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="camion"
                                value={form.id_camion}
                                onChange={e => setForm({ ...form, id_camion: Number(e.target.value) })}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-900 dark:text-white"
                                required
                            >
                                <option value={0}>-- Seleccione --</option>
                                {camiones.map(c => (
                                    <option key={c.id_camion} value={c.id_camion}>{c.placa}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha y Hora */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="fecha_carga" className="text-sm font-medium">
                                    Fecha <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="fecha_carga"
                                    type="date"
                                    value={form.fecha_carga}
                                    onChange={e => setForm({ ...form, fecha_carga: e.target.value })}
                                    required
                                    className="w-full text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="hora_carga" className="text-sm font-medium">
                                    Hora
                                </Label>
                                <Input
                                    id="hora_carga"
                                    type="time"
                                    value={form.hora_carga}
                                    onChange={e => setForm({ ...form, hora_carga: e.target.value })}
                                    className="w-full text-sm"
                                />
                            </div>
                        </div>

                        {/* Encargado de carga */}
                        <div className="space-y-1.5">
                            <Label htmlFor="encargado" className="text-sm font-medium">
                                Encargado de carga <span className="text-gray-400 text-xs">(opcional)</span>
                            </Label>
                            <select
                                id="encargado"
                                value={form.id_encargado_carga ?? 0}
                                onChange={e => setForm({ ...form, id_encargado_carga: Number(e.target.value) || null })}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-900 dark:text-white"
                            >
                                <option value={0}>-- Seleccione (opcional) --</option>
                                {encargados.map(u => (
                                    <option key={u.id_usuario} value={u.id_usuario}>
                                        {u.nombres} {u.apellidos || ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Repartidor asignado */}
                        <div className="space-y-1.5">
                            <Label htmlFor="repartidor" className="text-sm font-medium">
                                Repartidor asignado <span className="text-gray-400 text-xs">(opcional)</span>
                            </Label>
                            <select
                                id="repartidor"
                                value={form.id_repartidor_asignado ?? 0}
                                onChange={e => setForm({ ...form, id_repartidor_asignado: Number(e.target.value) || null })}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-900 dark:text-white"
                            >
                                <option value={0}>-- Seleccione (opcional) --</option>
                                {repartidores.map(u => (
                                    <option key={u.id_usuario} value={u.id_usuario}>
                                        {u.nombres} {u.apellidos || ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Observaciones (ocupa todo el ancho) */}
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="observaciones" className="text-sm font-medium">
                                Observaciones <span className="text-gray-400 text-xs">(opcional)</span>
                            </Label>
                            <textarea
                                id="observaciones"
                                rows={2}
                                value={form.observaciones ?? ''}
                                onChange={e => setForm({ ...form, observaciones: e.target.value || null })}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-900 dark:text-white"
                                placeholder="Notas adicionales (ej. condiciones especiales, rutas, etc.)"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-5 text-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="px-5 text-sm"
                        >
                            {submitting ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                                    Guardando...
                                </>
                            ) : (
                                'Crear operación'
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Ayuda */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
            </div>
        </div>
    );
}