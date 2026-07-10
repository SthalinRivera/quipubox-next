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
import { CheckCircle, Plus, Trash2, ArrowLeft, ArrowRight, Package } from 'lucide-react';

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
    const [operacionEstado, setOperacionEstado] = useState<string>('');
    const { setPasoCompletado, setCurrentStep } = useCreacionCargaStore();
    const isLocked = operacionEstado === 'repartiendo' || operacionEstado === 'cancelada';

    const loadData = async () => {
        try {
            const [det, cal, opts, op] = await Promise.all([
                fetchWithAuth(`detalle-carga/${detalleId}`),
                fetchWithAuth<Calidad[]>(`detalle-carga/${detalleId}/calidades`),
                fetchWithAuth<{ id_calidad: number; nombre: string }[]>('calidades'),
                fetchWithAuth<any>(`operaciones-carga/${operacionId}`),
            ]);
            setDetalle(det);
            setCalidades(cal || []);
            setCalidadesOptions(opts || []);
            setOperacionEstado(op?.estado || '');
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const checkPaso2Completo = async () => {
        if (!operacionId) return;
        try {
            const detalles = await fetchWithAuth<any[]>(`operaciones-carga/${operacionId}/detalles`);
            if (detalles.length === 0) {
                setPasoCompletado(2, false);
                return;
            }
            const completado = detalles.every(d => {
                if (!d.es_reparto) return true;
                const totalCalidades = d.calidades?.reduce((s: number, c: any) => s + c.cantidad, 0) || 0;
                return totalCalidades === d.cantidad_jabas;
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
    const porcentaje = maxCantidad > 0 ? Math.round((totalActual / maxCantidad) * 100) : 0;
    const isComplete = pendiente === 0 && maxCantidad > 0;

    const handleAdd = async () => {
        if (newCalidad.id_calidad === 0 || newCalidad.cantidad <= 0) {
            toast.error('Complete los campos obligatorios');
            return;
        }
        if (totalActual + newCalidad.cantidad > maxCantidad) {
            toast.error(`La suma de calidades no puede exceder ${maxCantidad} jabas. Disponibles: ${pendiente}`);
            return;
        }
        const precio = newCalidad.precio_unitario
            ? parseFloat(newCalidad.precio_unitario.replace(',', '.'))
            : null;
        setSubmitting(true);
        try {
            await fetchWithAuth(`detalle-carga/${detalleId}/calidades`, {
                method: 'POST',
                body: {
                    id_calidad: newCalidad.id_calidad,
                    cantidad: newCalidad.cantidad,
                    precio_unitario: precio,
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!detalle) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">Detalle no encontrado</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Volver
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <Stepper />

            <div className="mt-6 space-y-6">
                {/* Banner when locked */}
                {isLocked && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-blue-700 dark:text-blue-300">Operación en tránsito</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">No se pueden agregar ni eliminar calidades.</p>
                        </div>
                    </div>
                )}

                {/* Encabezado con contexto */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Asignar calidades
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Distribuye las {maxCantidad} jabas del detalle entre las calidades disponibles.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Package className="w-4 h-4" />
                        <span>Fruta: {detalle.frutas?.nombre || '—'}</span>
                    </div>
                </div>

                {/* Barra de progreso visual */}
                <div className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
                        <span className={`text-sm font-semibold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {totalActual} / {maxCantidad} jabas ({porcentaje}%)
                        </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isComplete
                                    ? 'bg-green-500'
                                    : porcentaje > 70
                                        ? 'bg-blue-500'
                                        : 'bg-amber-500'
                            }`}
                            style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                    {isComplete && (
                        <div className="flex items-center gap-2 mt-3 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Todas las jabas están asignadas</span>
                        </div>
                    )}
                </div>

                {/* Formulario para agregar calidad */}
                {!isComplete && !isLocked && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/40">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                            Agregar calidad
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label className="text-gray-700 dark:text-gray-300 text-xs">Calidad *</Label>
                                <select
                                    value={newCalidad.id_calidad}
                                    onChange={e => setNewCalidad({ ...newCalidad, id_calidad: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={0}>Seleccione calidad</option>
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
                                    max={String(pendiente)}
                                    placeholder={`Máx: ${pendiente}`}
                                    value={newCalidad.cantidad}
                                    onChange={e => setNewCalidad({ ...newCalidad, cantidad: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-gray-700 dark:text-gray-300 text-xs">Precio unitario (opcional)</Label>
                                <Input
                                    type="number"
                                    step={0.01}
                                    placeholder="S/ 0.00"
                                    value={newCalidad.precio_unitario}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(',', '.');
                                        if (/^\d*\.?\d*$/.test(raw)) {
                                            setNewCalidad({ ...newCalidad, precio_unitario: raw });
                                        }
                                    }}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleAdd}
                            disabled={submitting || newCalidad.id_calidad === 0 || newCalidad.cantidad <= 0}
                            className="mt-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {submitting ? 'Agregando...' : 'Agregar calidad'}
                        </Button>
                    </div>
                )}

                {/* Lista de calidades asignadas */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                        Calidades asignadas ({calidades.length})
                    </h2>
                    {calidades.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                            <Package className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <p className="text-gray-500 dark:text-gray-400">Aún no se han asignado calidades</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Selecciona una calidad y cantidad arriba</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {calidades.map(cal => (
                                <div
                                    key={cal.id_detalle_carga_calidad}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {cal.cantidad}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {cal.calidades?.nombre}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {cal.cantidad} jabas
                                                {cal.precio_unitario && ` · S/ ${cal.precio_unitario} c/u`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemove(cal.id_detalle_carga_calidad)}
                                        disabled={isLocked}
                                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a la operación
                    </Button>
                    {isComplete && (
                        <Button onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}`)}>
                            Continuar
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}