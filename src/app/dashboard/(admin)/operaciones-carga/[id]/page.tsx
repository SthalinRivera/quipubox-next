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
import { PlusCircle } from 'lucide-react';

export default function OperacionDetallePage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const operacionId = Number(params.id);
    const { setPasoCompletado } = useCreacionCargaStore();

    const [loading, setLoading] = useState(true);
    const [detalles, setDetalles] = useState<any[]>([]);
    // Ejemplo: components/detalle-carga/DetallesCargaTable.tsx
    interface DetallesCargaTableProps {
        operacionId: number;
        onRefresh?: () => void; // ← agregar esta línea
    }
    // Cargar los detalles de la operación para verificar si el paso 2 está completo
    const loadDetalles = async () => {
        try {
            const data = await fetchWithAuth<any[]>(`operaciones-carga/${operacionId}/detalles`);
            setDetalles(data || []);
            // Verificar si todos los detalles tienen calidades completas (cuando es reparto)
            if (data && data.length > 0) {
                const completado = data.every(det => {
                    if (!det.es_reparto) return true;
                    const totalCalidades = det.calidades?.reduce((s: number, c: any) => s + c.cantidad, 0) || 0;
                    return totalCalidades === det.cantidad_jabas;
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
                <div className="flex justify-end">
                    <Button onClick={() => router.push(`/dashboard/operaciones-carga/${operacionId}/detalles/nuevo`)}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Agregar detalle
                    </Button>
                </div>
                <ComponentCard title="Detalles de carga">
                    <DetallesCargaTable operacionId={operacionId} onRefresh={loadDetalles} />
                </ComponentCard>
            </div>
        </div>
    );
}