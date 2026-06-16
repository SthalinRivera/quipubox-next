// app/dashboard/operaciones-carga/[id]/detalles/[detalleId]/calidades/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Stepper } from '@/components/ui/Stepper';
import { useCreacionCargaStore } from '@/stores/creacionCargaStore';

interface Calidad {
    id_detalle_carga_calidad: number;
    id_calidad: number;
    cantidad: number;
    precio_unitario: number | null;
    calidades: { nombre: string };
}

export default function CalidadesPage() {
    const { id: operacionId, detalleId } = useParams();
    const router = useRouter();
    const toast = useToast();
    const [detalle, setDetalle] = useState<any>(null);
    const [calidades, setCalidades] = useState<Calidad[]>([]);
    const [calidadesOptions, setCalidadesOptions] = useState<{ id_calidad: number; nombre: string }[]>([]);
    const [newCalidad, setNewCalidad] = useState({ id_calidad: 0, cantidad: 1, precio_unitario: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { setPasoCompletado } = useCreacionCargaStore();

    // Cargar datos: detalle, calidades existentes y catálogo de calidades
    const loadData = async () => {
        try {
            const [det, cal, opts] = await Promise.all([
                fetchWithAuth(`detalle-carga/${detalleId}`),
                fetchWithAuth<Calidad[]>(`detalle-carga/${detalleId}/calidades`),
                fetchWithAuth<{ id_calidad: number; nombre: string }[]>('calidades'),
            ]);
            setDetalle(det);
            setCalidades(cal || []);
            setCalidadesOptions(opts || []);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Verificar si todos los detalles de la operación tienen sus calidades completas
    const checkPaso2Completo = async () => {
        if (!operacionId) return;
        try {
            const detalles = await fetchWithAuth<any[]>(`operaciones-carga/${operacionId}/detalles`);
            if (detalles.length === 0) {
                setPasoCompletado(2, false);
                return;
            }
            const completado = detalles.every(det => {
                if (!det.es_reparto) return true; // los detalles sin reparto no requieren calidades
                const totalCalidades = det.calidades?.reduce((s: number, c: any) => s + c.cantidad, 0) || 0;
                return totalCalidades === det.cantidad_jabas;
            });
            setPasoCompletado(2, completado);
        } catch (err) {
            console.error('Error al verificar completado de paso 2', err);
        }
    };

    useEffect(() => {
        loadData();
    }, [detalleId]);

    // Cada vez que cambian las calidades, actualizamos el estado del paso 2
    useEffect(() => {
        if (!loading) {
            checkPaso2Completo();
        }
    }, [calidades, loading]);

    const totalActual = calidades.reduce((sum, c) => sum + c.cantidad, 0);
    const maxCantidad = detalle?.cantidad_jabas || 0;

    const handleAdd = async () => {
        if (newCalidad.id_calidad === 0 || newCalidad.cantidad <= 0) {
            toast.error('Complete los campos obligatorios');
            return;
        }
        if (totalActual + newCalidad.cantidad > maxCantidad) {
            toast.error(`La suma de calidades no puede exceder ${maxCantidad} jabas. Disponibles: ${maxCantidad - totalActual}`);
            return;
        }
        setSubmitting(true);
        try {
            await fetchWithAuth(`detalle-carga/${detalleId}/calidades`, {
                method: 'POST',
                body: {
                    id_calidad: newCalidad.id_calidad,
                    cantidad: newCalidad.cantidad,
                    precio_unitario: newCalidad.precio_unitario ? parseFloat(newCalidad.precio_unitario) : null,
                },
            });
            toast.success('Calidad agregada');
            await loadData();               // recarga la página
            await checkPaso2Completo();    // actualiza el store
            setNewCalidad({ id_calidad: 0, cantidad: 1, precio_unitario: '' });
        } catch (err: any) {
            toast.error(err.message || 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm('¿Eliminar esta calidad?')) return;
        try {
            await fetchWithAuth(`detalle-carga/calidades/${id}`, { method: 'DELETE' });
            toast.success('Calidad eliminada');
            await loadData();
            await checkPaso2Completo();
        } catch (err: any) {
            toast.error(err.message || 'Error');
        }
    };
    const { setCurrentStep } = useCreacionCargaStore();
    useEffect(() => {
        setCurrentStep(2);
    }, []);
    if (loading) return <div className="p-6 text-center">Cargando...</div>;
    if (!detalle) return <div className="p-6 text-center">Detalle no encontrado</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Stepper siempre visible */}
            <Stepper />
            <h1 className="text-2xl font-bold mt-4">Calidades del detalle</h1>
            <p className="text-gray-500 mb-4">
                Jabas totales: {maxCantidad} | Asignadas: {totalActual} | Pendientes: {maxCantidad - totalActual}
            </p>

            {totalActual < maxCantidad && (
                <div className="border p-4 rounded mb-6 bg-gray-50 dark:bg-gray-800/30">
                    <h2 className="font-semibold mb-2">Agregar nueva calidad</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                            value={newCalidad.id_calidad}
                            onChange={e => setNewCalidad({ ...newCalidad, id_calidad: Number(e.target.value) })}
                            className="border rounded p-2"
                        >
                            <option value={0}>Seleccione calidad</option>
                            {calidadesOptions.map(c => (
                                <option key={c.id_calidad} value={c.id_calidad}>{c.nombre}</option>
                            ))}
                        </select>
                        <Input
                            type="number"
                            min="1"
                            placeholder="Cantidad"
                            value={newCalidad.cantidad}
                            onChange={e => setNewCalidad({ ...newCalidad, cantidad: Number(e.target.value) })}
                        />
                        <Input
                            type="number"
                            step={0.01}
                            placeholder="Precio unitario (opcional)"
                            value={newCalidad.precio_unitario}
                            onChange={e => setNewCalidad({ ...newCalidad, precio_unitario: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleAdd} disabled={submitting} className="mt-2">Agregar calidad</Button>
                </div>
            )}

            <h2 className="font-semibold mb-2">Calidades asignadas</h2>
            {calidades.length === 0 ? (
                <p className="text-gray-500">No hay calidades registradas.</p>
            ) : (
                <ul className="space-y-2">
                    {calidades.map(cal => (
                        <li key={cal.id_detalle_carga_calidad} className="flex justify-between items-center border p-2 rounded">
                            <div>
                                <span className="font-medium">{cal.calidades?.nombre}</span> - {cal.cantidad} jabas
                                {cal.precio_unitario && <span className="ml-2 text-sm">S/ {cal.precio_unitario}</span>}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleRemove(cal.id_detalle_carga_calidad)}>
                                Eliminar
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}`)}>
                    Volver a la operación
                </Button>
                {totalActual === maxCantidad && maxCantidad > 0 && (
                    <Button onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}`)}>
                        Detalle completo
                    </Button>
                )}
            </div>
        </div>
    );
}