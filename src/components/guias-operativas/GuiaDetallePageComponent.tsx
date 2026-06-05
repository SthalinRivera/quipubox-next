// components/guias-operativas/GuiaDetallePageComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Truck, Pencil, Printer } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { RegistrarEntregaModal } from '@/components/entregas/RegistrarEntregaModal';
import { EditarEntregaModal } from '@/components/entregas/EditarEntregaModal';
import type { GuiaOperativa } from '@/types/guiaOperativa';
import type { Entrega } from '@/types/entrega';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { GuiaPDF } from './GuiaPDF';
type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

const ESTADO_COLOR: Record<string, BadgeColor> = {
    emitida: 'warning',
    firmada: 'success',
    anulada: 'error',
    reemplazada: 'info',
    observada: 'info',
};

interface Props {
    id: string | number;
}

export function GuiaDetallePageComponent({ id }: Props) {
    const [guia, setGuia] = useState<GuiaOperativa | null>(null);
    const [loading, setLoading] = useState(true);
    const [entregaModalOpen, setEntregaModalOpen] = useState(false);
    const [editandoEntrega, setEditandoEntrega] = useState<Entrega | null>(null);
    const toast = useToast();

    const fetchGuia = async () => {
        try {
            const data = await fetchWithAuth<GuiaOperativa>(`guias-operativas/${id}`);
            setGuia(data);
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar la guía');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchGuia();
    }, [id]);

    const handleFirmar = async () => {
        if (!guia) return;
        if (window.confirm('¿Marcar esta guía como firmada?')) {
            try {
                await fetchWithAuth(`guias-operativas/${guia.id_guia}/firmar`, { method: 'PATCH' });
                toast.success('Guía firmada');
                fetchGuia();
            } catch (err: any) {
                toast.error(err.message);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center text-gray-700 dark:text-gray-300">Cargando guía...</div>;
    if (!guia) return <div className="p-8 text-center text-red-500">Guía no encontrada</div>;

    const itemReparto = guia.items_reparto;

    return (
        <div className="space-y-6">
            {/* Información general */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                    Información de la guía
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Número de Guía</p>
                        <p className="font-medium text-gray-800 dark:text-white/90">{guia.numero_guia}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Emisión</p>
                        <p className="text-gray-800 dark:text-white/90">{formatDate(guia.fecha_emision)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Repartidor</p>
                        <p className="text-gray-800 dark:text-white/90">
                            {guia.usuarios?.nombres || guia.id_repartidor || '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                        <Badge size="sm" color={ESTADO_COLOR[guia.estado] || 'secondary'}>
                            {guia.estado}
                        </Badge>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Observaciones</p>
                        <p className="text-gray-800 dark:text-white/90">{guia.observaciones || '—'}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 print:hidden">
                    <PDFDownloadLink
                        document={<GuiaPDF guia={guia} empresa={guia.empresas!} logoUrl="/logo.png" />}
                        fileName={`guia-${guia.numero_guia}.pdf`}
                    >
                        {({ loading }) => (
                            <Button size="sm" variant="outline" disabled={loading}>
                                {loading ? 'Generando PDF...' : 'Descargar PDF'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                    {guia.estado !== 'firmada' && guia.estado !== 'anulada' && (
                        <Button size="sm" onClick={handleFirmar} startIcon={<Truck className="w-4 h-4" />}>
                            Firmar guía
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEntregaModalOpen(true)}
                        disabled={guia.estado === 'anulada'}
                    >
                        Registrar Entrega
                    </Button>
                </div>
            </div>

            {/* Items de reparto */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Items de Reparto</h3>
                {itemReparto ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Cliente Receptor</p>
                                <p className="font-medium text-gray-800 dark:text-white/90">
                                    {itemReparto.clientes?.nombres || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Puesto</p>
                                <p className="font-medium text-gray-800 dark:text-white/90">
                                    {itemReparto.puestos?.numero_puesto || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad Asignada</p>
                                <p className="font-medium text-gray-800 dark:text-white/90">{itemReparto.cantidad_asignada}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sección</p>
                                <p className="font-medium text-gray-800 dark:text-white/90">{itemReparto.seccion || '—'}</p>
                            </div>
                        </div>
                        {(itemReparto.items_reparto_detalle?.length ?? 0) > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-white/90 mb-2">Calidades</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="text-left py-2 text-gray-600 dark:text-gray-400">Calidad</th>
                                                <th className="text-left py-2 text-gray-600 dark:text-gray-400">Cantidad</th>
                                                <th className="text-left py-2 text-gray-600 dark:text-gray-400">Precio Unit.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itemReparto.items_reparto_detalle!.map((det) => (
                                                <tr key={det.id_item_reparto_detalle} className="border-b border-gray-100 dark:border-gray-800">
                                                    <td className="py-2 text-gray-800 dark:text-white/90">
                                                        {det.detalle_carga_calidades?.calidades?.nombre || '—'}
                                                    </td>
                                                    <td className="py-2 text-gray-800 dark:text-white/90">{det.cantidad}</td>
                                                    <td className="py-2 text-gray-800 dark:text-white/90">
                                                        {det.precio_unitario ? `S/ ${det.precio_unitario}` : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No hay items de reparto asociados</p>
                )}
            </div>

            {/* Entregas */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Entregas</h3>
                {(guia.entregas?.length ?? 0) > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Fecha/Hora</th>
                                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Cant. Entregada</th>
                                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Cant. Rechazada</th>
                                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Recibe</th>
                                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Firma</th>
                                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guia.entregas!.map((entrega) => (
                                    <tr key={entrega.id_entrega} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-2 text-gray-800 dark:text-white/90">
                                            {formatDate(entrega.fecha_entrega)} {entrega.hora_entrega?.slice(0, 5)}
                                        </td>
                                        <td className="py-2 text-gray-800 dark:text-white/90">{entrega.cantidad_entregada}</td>
                                        <td className="py-2 text-gray-800 dark:text-white/90">{entrega.cantidad_rechazada}</td>
                                        <td className="py-2 text-gray-800 dark:text-white/90">{entrega.nombre_recibe || '—'}</td>
                                        <td className="py-2 text-gray-800 dark:text-white/90">
                                            {entrega.firma_recibido ? '✅ Sí' : '❌ No'}
                                        </td>
                                        <td className="py-2">
                                            <button
                                                onClick={() => setEditandoEntrega(entrega)}
                                                className="text-blue-500 hover:text-blue-600 transition-colors print:hidden"
                                                title="Editar entrega"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No hay entregas registradas</p>
                )}
            </div>

            {/* Modales */}
            <RegistrarEntregaModal
                open={entregaModalOpen}
                onOpenChange={setEntregaModalOpen}
                guia={guia}
                onSaved={fetchGuia}
            />

            {editandoEntrega && (
                <EditarEntregaModal
                    open={!!editandoEntrega}
                    onOpenChange={(open) => !open && setEditandoEntrega(null)}
                    entrega={editandoEntrega}
                    onSaved={fetchGuia}
                />
            )}


        </div>
    );
}