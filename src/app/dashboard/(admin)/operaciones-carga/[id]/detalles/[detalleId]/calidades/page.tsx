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
    const { setPasoCompletado, setCurrentStep } = useCreacionCargaStore();

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

    useEffect(() => {
        if (!loading) {
            checkPaso2Completo();
        }
    }, [calidades, loading]);

    useEffect(() => {
        setCurrentStep(2);
    }, [setCurrentStep]);

    const totalActual = calidades.reduce((sum, c) => sum + c.cantidad, 0);
    const maxCantidad = detalle?.cantidad_jabas || 0;
    const pendiente = maxCantidad - totalActual;

    const handleAdd = async () => {
        if (newCalidad.id_calidad === 0 || newCalidad.cantidad <= 0) {
            toast.error('Complete los campos obligatorios');
            return;
        }
        if (totalActual + newCalidad.cantidad > maxCantidad) {
            toast.error(`La suma de calidades no puede exceder ${maxCantidad} jabas. Disponibles: ${pendiente}`);
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
            await loadData();
            await checkPaso2Completo();
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

    if (loading) return <div className="p-6 text-center text-gray-600 dark:text-gray-400">Cargando...</div>;
    if (!detalle) return <div className="p-6 text-center text-red-600 dark:text-red-400">Detalle no encontrado</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <Stepper />
            <div className="mt-6 space-y-6">
                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Calidades del detalle
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Distribuye las jabas en calidades. La suma debe igualar el total.
                    </p>
                </div>

                {/* Resumen de jabas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total jabas</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{maxCantidad}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Asignadas</p>
                        <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{totalActual}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Pendientes</p>
                        <p className={`text-xl font-semibold ${pendiente === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {pendiente}
                        </p>
                    </div>
                </div>

                {/* Formulario para agregar calidad */}
                {pendiente > 0 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/40 shadow-sm">
                        <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            Agregar nueva calidad
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-gray-700 dark:text-gray-300 text-xs">Calidad *</Label>
                                <select
                                    value={newCalidad.id_calidad}
                                    onChange={e => setNewCalidad({ ...newCalidad, id_calidad: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={0}>Seleccione</option>
                                    {calidadesOptions.map(c => (
                                        <option key={c.id_calidad} value={c.id_calidad}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-gray-700 dark:text-gray-300 text-xs">Cantidad *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Cantidad"
                                    value={newCalidad.cantidad}
                                    onChange={e => setNewCalidad({ ...newCalidad, cantidad: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-gray-700 dark:text-gray-300 text-xs">Precio unitario (opcional)</Label>
                                <Input
                                    type="number"
                                    step={0.01}
                                    placeholder="S/ 0.00"
                                    value={newCalidad.precio_unitario}
                                    onChange={e => setNewCalidad({ ...newCalidad, precio_unitario: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleAdd}
                            disabled={submitting}
                            className="mt-3 w-full sm:w-auto"
                        >
                            {submitting ? 'Agregando...' : 'Agregar calidad'}
                        </Button>
                    </div>
                )}

                {/* Lista de calidades asignadas */}
                <div>
                    <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Calidades asignadas
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({calidades.length})
                        </span>
                    </h2>
                    {calidades.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            No hay calidades registradas.
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {calidades.map(cal => (
                                <li key={cal.id_detalle_carga_calidad} className="flex flex-wrap justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/30 hover:shadow-sm transition-shadow">
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {cal.calidades?.nombre}
                                        </span>
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                            {cal.cantidad} jabas
                                        </span>
                                        {cal.precio_unitario && (
                                            <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400">
                                                S/ {cal.precio_unitario}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemove(cal.id_detalle_carga_calidad)}
                                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                                    >
                                        Eliminar
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}`)}
                    >
                        Volver a la operación
                    </Button>
                    {totalActual === maxCantidad && maxCantidad > 0 && (
                        <Button onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}`)}>
                            Detalle completo
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}