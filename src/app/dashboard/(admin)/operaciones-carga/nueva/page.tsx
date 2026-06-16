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
    // ✅ Definir el tipo de respuesta esperada al crear una operación
    interface NuevaOperacionResponse {
        id_operacion: number;
    }
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
                toast.error('No se pudieron cargar los datos');
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
            toast.error('Complete los campos obligatorios');
            return;
        }
        setSubmitting(true);
        try {
            const nueva = await fetchWithAuth<NuevaOperacionResponse>('operaciones-carga', { method: 'POST', body: form });

            toast.success('Operación creada');
            setOperacion(nueva.id_operacion, form); // guardar en store
            setCurrentStep(2);                      // paso siguiente
            router.push(`/dashboard/operaciones-carga/${nueva.id_operacion}`);
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="p-6 text-center">Cargando datos necesarios...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-2">Nueva operación de carga</h1>
            <p className="text-gray-500 mb-6">Complete los datos de la operación</p>
            <Stepper />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sede origen */}
                    <div className="space-y-2">
                        <Label>Sede origen *</Label>
                        <select
                            value={form.id_sede_origen}
                            onChange={e => setForm({ ...form, id_sede_origen: Number(e.target.value) })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800"
                        >
                            <option value={0}>-- Seleccione --</option>
                            {sedesOrigen.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre}</option>)}
                        </select>
                    </div>
                    {/* Sede destino */}
                    <div className="space-y-2">
                        <Label>Sede destino</Label>
                        <select
                            value={form.id_sede_destino ?? 0}
                            onChange={e => setForm({ ...form, id_sede_destino: Number(e.target.value) || null })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800"
                        >
                            <option value={0}>-- Seleccione (opcional) --</option>
                            {sedesDestino.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre}</option>)}
                        </select>
                    </div>
                    {/* Camión */}
                    <div className="space-y-2">
                        <Label>Camion *</Label>
                        <select
                            value={form.id_camion}
                            onChange={e => setForm({ ...form, id_camion: Number(e.target.value) })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800"
                        >
                            <option value={0}>-- Seleccione --</option>
                            {camiones.map(c => <option key={c.id_camion} value={c.id_camion}>{c.placa}</option>)}
                        </select>
                    </div>
                    {/* Fecha */}
                    <div className="space-y-2">
                        <Label>Fecha *</Label>
                        <Input type="date" value={form.fecha_carga} onChange={e => setForm({ ...form, fecha_carga: e.target.value })} required />
                    </div>
                    {/* Hora */}
                    <div className="space-y-2">
                        <Label>Hora</Label>
                        <Input type="time" value={form.hora_carga} onChange={e => setForm({ ...form, hora_carga: e.target.value })} />
                    </div>
                    {/* Encargado */}
                    <div className="space-y-2">
                        <Label>Encargado de carga</Label>
                        <select
                            value={form.id_encargado_carga ?? 0}
                            onChange={e => setForm({ ...form, id_encargado_carga: Number(e.target.value) || null })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800"
                        >
                            <option value={0}>-- Seleccione (opcional) --</option>
                            {encargados.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos || ''}</option>)}
                        </select>
                    </div>
                    {/* Repartidor */}
                    <div className="space-y-2">
                        <Label>Repartidor asignado</Label>
                        <select
                            value={form.id_repartidor_asignado ?? 0}
                            onChange={e => setForm({ ...form, id_repartidor_asignado: Number(e.target.value) || null })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800"
                        >
                            <option value={0}>-- Seleccione (opcional) --</option>
                            {repartidores.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos || ''}</option>)}
                        </select>
                    </div>
                    {/* Observaciones */}
                    <div className="md:col-span-2 space-y-2">
                        <Label>Observaciones</Label>
                        <textarea
                            rows={2}
                            value={form.observaciones ?? ''}
                            onChange={e => setForm({ ...form, observaciones: e.target.value || null })}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Crear'}</Button>
                </div>
            </form>
        </div>
    );
}