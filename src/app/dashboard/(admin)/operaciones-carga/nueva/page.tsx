'use client';
// app/dashboard/operaciones-carga/nueva/page.tsx
import { NuevaOperacionSkeleton } from '@/components/ui/skeleton/OperationSkeleton';


import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import DatePicker from '@/components/ui/date-picker/DatePicker';
import { format } from 'date-fns';
import { useCreacionCargaStore } from '@/stores/creacionCargaStore';
import { Stepper } from '@/components/ui/Stepper';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Sede {
    id_ubigeo: string;
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
        id_ubigeo_origen: '',
        id_ubigeo_destino: '',
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
                    fetchWithAuth<Sede[]>('ubicaciones'),
                    fetchWithAuth<Camion[]>('camiones'),
                    fetchWithAuth<Usuario[]>('usuarios'),
                ]);
                if (!mounted) return;
                const sedes = sedesRes || [];
                setSedesOrigen(sedes);
                setSedesDestino(sedes);
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
        if (submitting) return;
        if (!form.id_ubigeo_origen || !form.id_ubigeo_destino || form.id_camion === 0 || !form.fecha_carga) {
            toast.error('Por favor, complete los campos obligatorios (Ubicación de origen, Camión y Fecha).');
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
        } catch (err: unknown) {
            toast.error((err instanceof Error ? err.message : null) || 'Error al guardar la operación. Verifique los datos.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <NuevaOperacionSkeleton />;

    return (
        <div className="mx-auto max-w-full space-y-4 pb-6">
            <div>
                <button type="button" onClick={() => router.push("/dashboard/operaciones-carga") } className="mb-2 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-500 transition hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 dark:text-gray-400">
                    <ArrowLeft size={16} aria-hidden="true" /> Volver a operaciones
                </button>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900  dark:text-white">Nueva carga</h1>
                    </div>
                </div>
            </div>

            <div className="">
                <Stepper />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="grid divide-y divide-gray-100 md:grid-cols-2 dark:divide-gray-800">
                        <section className="p-4">
                            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Ruta</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Ubicación de origen */}
                        <div className="space-y-1.5">
                            <Label htmlFor="sede_origen" className="text-sm font-medium">
                                Ubicación de origen <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="sede_origen"
                                value={form.id_ubigeo_origen}
                                onChange={e => setForm({ ...form, id_ubigeo_origen: e.target.value })}
                                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                required
                            >
                                <option value={0}>Selecciona una opción</option>
                                {sedesOrigen.map(s => (
                                    <option key={s.id_ubigeo} value={s.id_ubigeo}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                                {/* Ubicación de destino */}
                        <div className="space-y-1.5">
                            <Label htmlFor="sede_destino" className="text-sm font-medium">
                                Ubicación de destino <span className="text-gray-400 text-xs">(opcional)</span>
                            </Label>
                            <select
                                id="sede_destino"
                                value={form.id_ubigeo_destino}
                                onChange={e => setForm({ ...form, id_ubigeo_destino: e.target.value })}
                                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value={0}>Sin asignar</option>
                                {sedesDestino.map(s => (
                                    <option key={s.id_ubigeo} value={s.id_ubigeo}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                            </div>
                        </section>
                        <section className="p-4 md:border-t-0! md:border-l md:border-gray-100 dark:md:border-gray-800">
                            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Camión y fecha</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Camión */}
                        <div className="space-y-1.5">
                            <Label htmlFor="camion" className="text-sm font-medium">
                                Camión <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="camion"
                                value={form.id_camion}
                                onChange={e => setForm({ ...form, id_camion: Number(e.target.value) })}
                                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                required
                            >
                                <option value={0}>Selecciona una opción</option>
                                {camiones.map(c => (
                                    <option key={c.id_camion} value={c.id_camion}>{c.placa}</option>
                                ))}
                            </select>
                        </div>
                                {/* Fecha y Hora */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <DatePicker
                                    label="Fecha *"
                                    value={form.fecha_carga}
                                    onChange={fecha_carga => setForm({ ...form, fecha_carga })}
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
                            </div>
                        </section>
                        <section className="p-4 md:col-span-2">
                            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Responsables</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Encargado de carga */}
                        <div className="space-y-1.5">
                            <Label htmlFor="encargado" className="text-sm font-medium">
                                Encargado de carga <span className="text-gray-400 text-xs">(opcional)</span>
                            </Label>
                            <select
                                id="encargado"
                                value={form.id_encargado_carga ?? 0}
                                onChange={e => setForm({ ...form, id_encargado_carga: Number(e.target.value) || null })}
                                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value={0}>Sin asignar</option>
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
                                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value={0}>Sin asignar</option>
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
                                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Indicaciones adicionales"
                            />
                        </div>
                            </div>
                        </section>
                    </div>


                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-semibold text-red-500">*</span> Obligatorio</p>
                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/operaciones-carga") } disabled={submitting}>Cancelar</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Guardando...</> : <>Crear carga <ArrowRight size={16} aria-hidden="true" /></>}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
