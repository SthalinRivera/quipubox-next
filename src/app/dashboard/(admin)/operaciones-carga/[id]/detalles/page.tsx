// app/dashboard/operaciones-carga/[id]/detalles/page.tsx
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api-client';
import Button from '@/components/ui/button/Button';
import { PlusCircle, Package, TrendingUp } from 'lucide-react';

// Definir interfaces según la respuesta esperada
interface Camion {
    placa: string;
}

interface Operacion {
    id_operacion: number;
    fecha_carga: string;
    camiones?: Camion;
}

interface Cliente {
    nombres: string;
}

interface Fruta {
    nombre: string;
}

interface TipoJaba {
    nombre: string;
}

interface Detalle {
    id_detalle_carga: number;
    cantidad_jabas: number;
    es_reparto: boolean;
    clientes?: Cliente;
    frutas?: Fruta;
    tipos_jaba?: TipoJaba;
}

export default function DetallesOperacion() {
    const { id } = useParams();
    const router = useRouter();
    const [operacion, setOperacion] = useState<Operacion | null>(null);
    const [detalles, setDetalles] = useState<Detalle[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [op, dets] = await Promise.all([
                    fetchWithAuth<Operacion>(`/operaciones-carga/${id}`),
                    fetchWithAuth<Detalle[]>(`/operaciones-carga/${id}/detalles`),
                ]);
                setOperacion(op);
                setDetalles(dets);
            } catch (error) {
                console.error(error);
            }
        };
        if (id) fetchData();
    }, [id]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Carga #{id}</h1>
                    <p className="text-gray-500">
                        {operacion?.fecha_carga ? new Date(operacion.fecha_carga).toLocaleDateString() : 'Cargando...'} |
                        Camión: {operacion?.camiones?.placa || '—'}
                    </p>
                </div>
                <Link href={`/dashboard/operaciones-carga/${id}/detalles/nuevo`}>
                    <Button><PlusCircle className="w-4 h-4 mr-1" /> Agregar detalle</Button>
                </Link>
            </div>

            <div className="space-y-3">
                {detalles.length === 0 ? (
                    <p className="text-gray-500">No hay detalles de carga.</p>
                ) : (
                    detalles.map((det) => (
                        <div key={det.id_detalle_carga} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">
                                        {det.clientes?.nombres || 'N/A'} – {det.frutas?.nombre || 'N/A'} ({det.cantidad_jabas} jabas)
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Tipo: {det.tipos_jaba?.nombre || 'N/A'} | Reparto: {det.es_reparto ? 'Sí' : 'No'}
                                    </p>
                                </div>
                                {det.es_reparto && (
                                    <Link href={`/dashboard/detalle-carga/${det.id_detalle_carga}/calidades`}>
                                        <Button variant="outline" size="sm"><TrendingUp className="w-4 h-4 mr-1" /> Calidades</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}