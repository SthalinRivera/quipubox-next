// app/dashboard/operaciones-carga/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import { Stepper } from '@/components/ui/Stepper';
import { useCreacionCargaStore } from '@/stores/creacionCargaStore';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import DetallesCargaTable from '@/components/detalle-carga/DetallesCargaTable';
import Button from '@/components/ui/button/Button';
import { PlusCircle, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

export default function OperacionDetallePage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const operacionId = Number(params.id);
    const { setPasoCompletado } = useCreacionCargaStore();

    const [loading, setLoading] = useState(true);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [operacion, setOperacion] = useState<any>(null);
    const [finalizando, setFinalizando] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [erroresFinalizar, setErroresFinalizar] = useState<string[]>([]);

    const isCompleted = operacion?.estado === 'repartiendo';
    const isCancelled = operacion?.estado === 'cancelada';
    const isLocked = isCompleted || isCancelled;

    const loadDetalles = async () => {
        try {
            const [det, op] = await Promise.all([
                fetchWithAuth<any[]>(`operaciones-carga/${operacionId}/detalles`),
                fetchWithAuth<any>(`operaciones-carga/${operacionId}`),
            ]);
            setDetalles(det || []);
            setOperacion(op);

            if (det && det.length > 0) {
                const completado = det.every(d => {
                    if (!d.es_reparto) return true;
                    const totalCalidades = d.calidades?.reduce((s: number, c: any) => s + c.cantidad, 0) || 0;
                    return totalCalidades === d.cantidad_jabas;
                });
                setPasoCompletado(2, completado);
            } else {
                setPasoCompletado(2, false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar detalles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (operacionId) {
            loadDetalles();
        }
    }, [operacionId]);

    const handleFinalizar = async () => {
        setFinalizando(true);
        setErroresFinalizar([]);
        try {
            await fetchWithAuth(`operaciones-carga/${operacionId}/finalizar`, { method: 'POST' });
            toast.success('Operación finalizada correctamente');
            setShowConfirmModal(false);
            await loadDetalles();
        } catch (err: any) {
            setErroresFinalizar([err.message || 'Error al finalizar']);
        } finally {
            setFinalizando(false);
        }
    };

    if (isNaN(operacionId)) {
        return <div className="p-6 text-red-500">ID de operación inválido</div>;
    }

    return (
        <div>
            <Stepper />
            <div className="mt-4">
                <PageBreadcrumb pageTitle={`Operación #${operacionId}`} />
            </div>

            <div className="space-y-6 mt-4">
                {/* Banner de estado cuando está en curso */}
                {isCompleted && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-blue-700 dark:text-blue-300">Operación en tránsito</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">La carga está en tránsito. No se pueden agregar ni modificar detalles.</p>
                        </div>
                    </div>
                )}

                {isCancelled && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-700 dark:text-red-300">Operación cancelada</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Esta operación fue cancelada y es de solo lectura.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    {!isLocked && (
                        <Button onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}/detalles/nuevo`)}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Agregar detalle
                        </Button>
                    )}
                    {!isLocked && detalles.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmModal(true)}
                            className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Finalizar operación
                        </Button>
                    )}
                </div>

                <ComponentCard title="Detalles de carga">
                    <DetallesCargaTable
                        operacionId={operacionId}
                        onRefresh={loadDetalles}
                        operacionEstado={operacion?.estado}
                    />
                </ComponentCard>
            </div>

            {/* Modal de confirmación de finalización */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finalizar operación</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">¿Estás seguro de que deseas finalizar esta operación?</p>
                            </div>
                        </div>

                        {/* Resumen */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resumen:</p>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• {detalles.length} detalle(s) de carga</li>
                            </ul>
                        </div>

                        {/* Errores de validación */}
                        {erroresFinalizar.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">No se puede finalizar:</p>
                                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                                    {erroresFinalizar.map((err, i) => (
                                        <li key={i}>• {err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setShowConfirmModal(false); setErroresFinalizar([]); }}
                                disabled={finalizando}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleFinalizar}
                                disabled={finalizando}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {finalizando ? 'Finalizando...' : 'Finalizar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}