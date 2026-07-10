'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useItemsReparto } from '@/hooks/useItemsReparto';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/button/Button';
import { Plus, RefreshCw, Eye, FileText, ClipboardList, CheckCircle, SearchIcon } from 'lucide-react';
import ItemRepartoSimpleForm from '@/components/items-reparto/ItemRepartoSimpleForm';
import { fetchWithAuth } from '@/lib/api-client';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { TableSkeleton } from '@/components/ui/skeleton/TableSkeleton';

type TabType = 'pendientes' | 'asignados';

export default function ItemsRepartoPage() {
    const router = useRouter();
    const toast = useToast();
    const { items, pendientes, loading, fetchItems, fetchPendientes } = useItemsReparto();
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedDetalle, setSelectedDetalle] = useState<any>(null);
    const [generating, setGenerating] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('pendientes');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchItems();
        fetchPendientes();
    }, [fetchItems, fetchPendientes]);

    const handleRepartir = (detalle: any) => {
        setSelectedDetalle(detalle);
        openModal();
    };

    const handleSuccess = () => {
        closeModal();
        setSelectedDetalle(null);
        fetchItems();
        fetchPendientes();
    };

    const handleGenerarGuiaPorPuesto = async (operacionId: number) => {
        if (!operacionId) {
            toast.error('No se puede generar guía: falta operación');
            return;
        }
        setGenerating(operacionId);
        try {
            await fetchWithAuth(`operaciones-carga/${operacionId}/generar-guias`, { method: 'POST' });
            toast.success('Guías generadas correctamente');
            await fetchItems();
            await fetchPendientes();
        } catch (error: any) {
            toast.error(error.message || 'Error al generar guías');
        } finally {
            setGenerating(null);
        }
    };

    const filteredPendientes = pendientes.filter((det: any) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            det.id_detalle_carga?.toString().includes(term) ||
            det.operaciones_carga?.camiones?.placa?.toLowerCase().includes(term) ||
            det.clientes?.nombres?.toLowerCase().includes(term)
        );
    });

    const itemsPorOperacionYPuesto = items.reduce((acc, item) => {
        const itemAny = item as any;
        const op = itemAny.detalle_carga?.operaciones_carga;
        const opId = op?.id_operacion ?? 'sin-operacion';
        if (!acc[opId]) acc[opId] = { operacion: op, puestos: {} };
        const puestoId = item.id_puesto;
        if (!acc[opId].puestos[puestoId]) acc[opId].puestos[puestoId] = [];
        acc[opId].puestos[puestoId].push(item);
        return acc;
    }, {} as Record<string, { operacion: any; puestos: Record<number, typeof items> }>);

    if (loading && items.length === 0 && pendientes.length === 0) {
        return (
            <div className="p-4">
                <TableSkeleton columns={8} rows={5} showActionButton={true} />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Cabecera */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Reparto</h1>
                <div className="flex items-center gap-3">

                    <Button
                        variant="outline"
                        onClick={() => { fetchItems(); fetchPendientes(); }}
                        className="text-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pendientes')}
                        className={`
                            py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium transition-colors
                            ${activeTab === 'pendientes'
                                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }
                        `}
                    >
                        <ClipboardList className="w-4 h-4" />
                        Pendientes de Reparto
                        {pendientes.length > 0 && (
                            <span className="ml-1 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-xs font-medium px-2 py-0.5 rounded-full">
                                {pendientes.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('asignados')}
                        className={`
                            py-3 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium transition-colors
                            ${activeTab === 'asignados'
                                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }
                        `}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Items Repartidos
                        {items.length > 0 && (
                            <span className="ml-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">
                                {items.length}
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* TAB PENDIENTES */}
            {activeTab === 'pendientes' && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[700px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">ID Detalle</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Operación</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Camión</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Sede Origen</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cliente Emisor</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cant. Jabas</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Calidades</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {filteredPendientes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                                <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                                No hay pendientes de asignación
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPendientes.map((det) => (
                                            <TableRow key={det.id_detalle_carga}>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{det.id_detalle_carga}</TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    #{det.operaciones_carga?.id_operacion || 'N/A'}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {det.operaciones_carga?.camiones?.placa || 'N/A'}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                    {det.operaciones_carga?.sedes_operaciones_carga_id_sede_origenTosedes?.nombre || 'N/A'}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {det.clientes?.nombres} {det.clientes?.apellidos || ''}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">{det.cantidad_jabas}</TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {det.detalle_carga_calidades.map((c: any) => {
                                                            const total = c.cantidad;
                                                            const asignado = c.cantidad_asignada || 0;
                                                            const pendiente = c.saldo || total - asignado;
                                                            let badgeColor: 'primary' | 'success' | 'warning' | 'error' | 'info' = 'info';
                                                            if (pendiente === total) badgeColor = 'primary';
                                                            else if (pendiente > 0 && pendiente < total) badgeColor = 'warning';
                                                            else if (pendiente === 0) badgeColor = 'success';
                                                            return (
                                                                <Badge
                                                                    key={c.id_detalle_carga_calidad}
                                                                    size="sm"
                                                                    color={badgeColor}
                                                                    title={`Total: ${total} | Asignado: ${asignado} | Pendiente: ${pendiente}`}
                                                                >
                                                                    {c.calidades.nombre} ({pendiente}/{total})
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRepartir(det)}
                                                        className="text-brand-600 border-brand-200 hover:bg-brand-50 dark:text-brand-400 dark:border-brand-800 dark:hover:bg-brand-900/20"
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" /> Repartir
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB ASIGNADOS */}
            {activeTab === 'asignados' && (
                    <div className="space-y-8">
                    {Object.keys(itemsPorOperacionYPuesto).length === 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                No hay items asignados
                            </div>
                        </div>
                    ) : (
                        Object.entries(itemsPorOperacionYPuesto).map(([opId, { operacion, puestos }]) => (
                            <div key={opId} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                                {/* Encabezado de Operación */}
                                <div className="flex flex-wrap items-center gap-4 px-5 py-4 bg-gray-50 dark:bg-white/[0.04] border-b border-gray-200 dark:border-white/[0.05]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Operación #{operacion?.id_operacion || opId}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            Camión: <span className="font-medium text-gray-700 dark:text-gray-300">{operacion?.camiones?.placa || 'N/A'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Origen: <span className="font-medium text-gray-700 dark:text-gray-300">{operacion?.sedes_operaciones_carga_id_sede_origenTosedes?.nombre || 'N/A'}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="max-w-full overflow-x-auto">
                                    <div className="min-w-[700px]">
                                        <Table>
                                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                <TableRow>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Puesto</TableCell>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cliente Receptor</TableCell>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Cantidades</TableCell>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Guía</TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                {Object.entries(puestos).map(([puestoId, itemsGrupo]) => {
                                                    const primerItem = itemsGrupo[0] as any;
                                                    const puestoInfo = primerItem?.puestos;
                                                    const lugarNombre = puestoInfo?.lugares_operativos?.nombre || '';
                                                    const itemConGuia = itemsGrupo.find((item: any) => (item as any).guia_asociada);
                                                    const tieneGuia = !!itemConGuia;
                                                    const guia = (itemConGuia as any)?.guia_asociada;
                                                    const operacionId = operacion?.id_operacion;

                                                    return (
                                                        <TableRow key={puestoId}>
                                                            <TableCell className="px-5 py-4">
                                                                <div className="font-medium text-gray-900 dark:text-white">{puestoInfo?.numero_puesto || '—'}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">{lugarNombre}</div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-4">
                                                                <div className="space-y-1">
                                                                    {itemsGrupo.map((item: any) => (
                                                                        <div key={item.id_item_reparto} className="text-sm text-gray-700 dark:text-gray-300">
                                                                            {item.clientes ? `${item.clientes.nombres} ${item.clientes.apellidos || ''}` : '—'}
                                                                            <span className="text-gray-400 dark:text-gray-500 ml-1">
                                                                                ({item.cantidad_asignada} jabas)
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-4">
                                                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {itemsGrupo.reduce((sum: number, item: any) => sum + (item.cantidad_asignada || 0), 0)} jabas totales
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-4">
                                                                {tieneGuia ? (
                                                                    <Link
                                                                        href={`/dashboard/guias-operativas/${guia.id_guia}`}
                                                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    >
                                                                        <FileText className="w-4 h-4" />
                                                                        {guia.numero_guia}
                                                                    </Link>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleGenerarGuiaPorPuesto(operacionId)}
                                                                        disabled={generating === operacionId}
                                                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                                                    >
                                                                        <FileText className="w-4 h-4" />
                                                                        {generating === operacionId ? 'Generando...' : 'Generar guía'}
                                                                    </button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            <ItemRepartoSimpleForm
                isOpen={isOpen}
                onClose={() => { closeModal(); setSelectedDetalle(null); }}
                onSuccess={handleSuccess}
                operacionId={selectedDetalle?.operaciones_carga?.id_operacion}
                defaultDetalleId={selectedDetalle?.id_detalle_carga}
            />
        </div>
    );
}