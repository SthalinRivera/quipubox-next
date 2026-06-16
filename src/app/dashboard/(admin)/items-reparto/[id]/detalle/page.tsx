// app/dashboard/items-reparto/[id]/detalle/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function ItemsRepartoDetallePage() {
    const { id } = useParams();
    const router = useRouter();
    const toast = useToast();
    const itemId = Number(id);

    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = async () => {
        try {
            const data = await fetchWithAuth<any>(`items-reparto/${itemId}`);
            setItem(data);
        } catch (err: any) {
            toast.error(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (itemId) fetchData();
    }, [itemId]);

    const handleGenerarGuia = async () => {
        setGenerating(true);
        try {
            await fetchWithAuth(`items-reparto/${itemId}/generar-guia`, { method: 'POST' });
            toast.success('Guía generada correctamente');
            await fetchData();
        } catch (err: any) {
            toast.error(err.message || 'Error al generar guía');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Cargando...</div>;
    if (!item) return <div className="p-6 text-center">No se encontró el ítem.</div>;

    const detalles = item.items_reparto_detalle || [];
    const guias = item.guias_operativas || [];
    const tieneGuia = guias.length > 0;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold">Detalles del ítem #{itemId}</h1>
            </div>

            {/* Datos del ítem */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-semibold">Cliente receptor:</span> {item.clientes?.nombres} {item.clientes?.apellidos || ''}</div>
                <div><span className="font-semibold">Puesto:</span> {item.puestos?.numero_puesto}</div>
                <div><span className="font-semibold">Cantidad asignada:</span> {item.cantidad_asignada} jabas</div>
                <div><span className="font-semibold">Sección:</span> {item.seccion || '—'}</div>
            </div>

            {/* Calidades */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">Calidades asignadas</h2>
                    {!tieneGuia && (
                        <Button size="sm" onClick={handleGenerarGuia} disabled={generating}>
                            <FileText className="h-4 w-4 mr-1" /> Generar guía
                        </Button>
                    )}
                </div>
                {detalles.length === 0 ? (
                    <p className="text-gray-500">No hay calidades asignadas.</p>
                ) : (
                    <div className="overflow-x-auto border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>Calidad</TableCell>
                                    <TableCell isHeader>Cantidad</TableCell>
                                    <TableCell isHeader>Precio unitario</TableCell>
                                    <TableCell isHeader>Subtotal</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detalles.map((det: any) => (
                                    <TableRow key={det.id_item_reparto_detalle}>
                                        <TableCell>{det.detalle_carga_calidades.calidades.nombre}</TableCell>
                                        <TableCell>{det.cantidad}</TableCell>
                                        <TableCell>{det.precio_unitario ? `S/ ${det.precio_unitario}` : '—'}</TableCell>
                                        <TableCell>{det.precio_unitario ? `S/ ${(det.cantidad * det.precio_unitario).toFixed(2)}` : '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Guías y entregas */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Guías y entregas</h2>
                {guias.length === 0 ? (
                    <p className="text-gray-500">No se ha generado ninguna guía.</p>
                ) : (
                    guias.map((guia: any) => (
                        <div key={guia.id_guia} className="border rounded-lg mb-4">
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 font-semibold">
                                Guía #{guia.numero_guia} | Estado: <Badge size="sm">{guia.estado}</Badge> | Emisión: {new Date(guia.fecha_emision).toLocaleDateString()}
                            </div>
                            {guia.entregas?.length === 0 ? (
                                <div className="p-3 text-gray-500">Sin entregas.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableCell isHeader>Fecha</TableCell>
                                                <TableCell isHeader>Hora</TableCell>
                                                <TableCell isHeader>Cantidad</TableCell>
                                                <TableCell isHeader>Estado</TableCell>
                                                <TableCell isHeader>Recibe</TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {guia.entregas.map((entrega: any) => (
                                                <TableRow key={entrega.id_entrega}>
                                                    <TableCell>{new Date(entrega.fecha_entrega).toLocaleDateString()}</TableCell>
                                                    <TableCell>{entrega.hora_entrega}</TableCell>
                                                    <TableCell>{entrega.cantidad_entregada}</TableCell>
                                                    <TableCell><Badge size="sm">{entrega.estado_entrega}</Badge></TableCell>
                                                    <TableCell>{entrega.nombre_recibe}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-end">
                <Button variant="outline" onClick={() => router.back()}>Volver</Button>
            </div>
        </div>
    );
}