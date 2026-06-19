'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import {
    Truck,
    Printer,
    ArrowLeft,
    Eye,
    MapPin,
    User,
    Package,
    Building2,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Layers,
    Apple,
    Box,
    RefreshCw,
    Info,
} from 'lucide-react';
import { formatDate } from '@/utils/date';
import { RegistrarEntregaModal } from '@/components/entregas/RegistrarEntregaModal';
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
    onBack?: () => void;
}

export function GuiaDetallePageComponent({ id, onBack }: Props) {
    const router = useRouter();
    const toast = useToast();
    const [guia, setGuia] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [entregaModalOpen, setEntregaModalOpen] = useState(false);

    const fetchGuia = async () => {
        try {
            const data = await fetchWithAuth<any>(`guias-operativas/${id}`);
            setGuia(data);
            return data;
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar la guía');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchGuia();
        }
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

    const handleVolver = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!guia) {
        return (
            <div className="p-8 text-center text-red-500">
                <p className="text-xl font-semibold">Guía no encontrada</p>
                <p className="text-sm mt-2">La guía con ID {id} no existe o ha sido eliminada.</p>
                <Button variant="outline" onClick={handleVolver} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
            </div>
        );
    }

    // ===== DATOS DEL BACKEND =====
    const itemReparto = guia.items_reparto;
    const detalleCarga = itemReparto?.detalle_carga;
    const operacion = detalleCarga?.operaciones_carga;
    const tieneEntregas = (guia.entregas?.length ?? 0) > 0;
    const totalEntregado = guia.entregas?.reduce((sum: number, e: any) => sum + e.cantidad_entregada, 0) || 0;
    const totalRechazado = guia.entregas?.reduce((sum: number, e: any) => sum + (e.cantidad_rechazada || 0), 0) || 0;
    const totalAsignado = itemReparto?.cantidad_asignada || 0;
    const porcentajeEntregado = totalAsignado > 0 ? Math.round((totalEntregado / totalAsignado) * 100) : 0;

    const puedeFirmar = guia.estado !== 'firmada' && guia.estado !== 'anulada';
    const puedeRegistrarEntrega = guia.estado !== 'anulada';

    // Datos virtuales
    const itemsDelPuesto = itemReparto?._items_del_puesto || [];
    const todasLasCalidades = itemReparto?._todas_las_calidades || [];
    const clientesAgrupados = itemReparto?._clientes_agrupados || [];

    // Agrupar calidades por nombre y guardar los items asociados
    const calidadesMap = new Map<string, { nombre: string; cantidad_total: number; items: any[]; precio_unitario: any }>();
    todasLasCalidades.forEach((det: any) => {
        const nombre = det.detalle_carga_calidades?.calidades?.nombre || 'Sin nombre';
        if (!calidadesMap.has(nombre)) {
            calidadesMap.set(nombre, {
                nombre,
                cantidad_total: 0,
                items: [],
                precio_unitario: det.precio_unitario,
            });
        }
        const entry = calidadesMap.get(nombre)!;
        entry.cantidad_total += det.cantidad;
        entry.items.push({
            item_id: det.item_id || det.id_item_reparto,
            cantidad: det.cantidad,
        });
        if (det.precio_unitario) entry.precio_unitario = det.precio_unitario;
    });

    const calidadesResumen = Array.from(calidadesMap.values());
    const totalGeneral = todasLasCalidades.reduce((sum: number, d: any) => {
        return sum + (d.precio_unitario ? d.cantidad * d.precio_unitario : 0);
    }, 0);

    // Extraer datos del detalle de carga
    const fruta = detalleCarga?.frutas?.nombre || '—';
    const variedad = detalleCarga?.variedades?.nombre || '—';
    const tipoJaba = detalleCarga?.tipos_jaba?.nombre || '—';
    const materialJaba = detalleCarga?.tipos_jaba?.tipo_material || '—';
    const requiereRetorno = detalleCarga?.requiere_retorno_jabas;
    const instruccionReparto = detalleCarga?.instruccion_reparto || '—';
    const clienteEmisor = detalleCarga?.clientes?.nombres
        ? `${detalleCarga.clientes.nombres} ${detalleCarga.clientes.apellidos || ''}`
        : '—';
    const cantidadJabas = detalleCarga?.cantidad_jabas || 0;

    return (
        <div className="space-y-6 print:space-y-2">
            {/* CABECERA */}
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <Button variant="outline" size="sm" onClick={handleVolver}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </Button>
                    <PDFDownloadLink
                        document={<GuiaPDF guia={guia} empresa={guia.empresas} logoUrl="/logo.png" />}
                        fileName={`guia-${guia.numero_guia}.pdf`}
                    >
                        {({ loading }) => (
                            <Button size="sm" variant="outline" disabled={loading}>
                                {loading ? 'Generando...' : 'Descargar PDF'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                    {puedeFirmar && (
                        <Button size="sm" onClick={handleFirmar}>
                            <Truck className="w-4 h-4 mr-2" /> Firmar guía
                        </Button>
                    )}
                    {puedeRegistrarEntrega && !tieneEntregas && (
                        <Button size="sm" variant="outline" onClick={() => setEntregaModalOpen(true)}>
                            Registrar Entrega
                        </Button>
                    )}
                </div>
            </div>

            {/* INFORMACIÓN GENERAL */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            Guía #{guia.numero_guia}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            Emitida el {formatDate(guia.fecha_emision)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge size="sm" color={ESTADO_COLOR[guia.estado] || 'secondary'}>
                            {guia.estado.toUpperCase()}
                        </Badge>
                        {porcentajeEntregado > 0 && (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {porcentajeEntregado}% entregado
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoItem icon={User} label="Repartidor" value={guia.usuarios?.nombres || '—'} />
                    <InfoItem icon={Building2} label="Empresa" value={guia.empresas?.razon_social || '—'} />
                    <InfoItem icon={Package} label="Items asignados" value={itemsDelPuesto.length} />
                    <InfoItem icon={Truck} label="Entregado / Rechazado" value={`${totalEntregado} / ${totalRechazado}`} />
                    <InfoItem icon={MapPin} label="Cliente receptor" value={clientesAgrupados.join(', ') || '—'} />
                    <InfoItem icon={MapPin} label="Puesto" value={itemReparto?.puestos?.numero_puesto || '—'} />
                    <InfoItem
                        icon={Eye}
                        label="Operación"
                        value={
                            operacion?.id_operacion ? (
                                <button
                                    onClick={() => router.push(`/dashboard/operaciones-carga/${operacion.id_operacion}`)}
                                    className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    #{operacion.id_operacion}
                                </button>
                            ) : (
                                '—'
                            )
                        }
                    />
                    <InfoItem icon={Truck} label="Camión" value={operacion?.camiones?.placa || '—'} />
                    <InfoItem icon={MapPin} label="Sede Origen" value={operacion?.sedes_operaciones_carga_id_sede_origenTosedes?.nombre || '—'} />
                    <InfoItem icon={MapPin} label="Sede Destino" value={operacion?.sedes_operaciones_carga_id_sede_destinoTosedes?.nombre || '—'} />
                    <InfoItem icon={Calendar} label="Fecha de carga" value={operacion?.fecha_carga ? formatDate(operacion.fecha_carga) : '—'} />
                    <InfoItem icon={Clock} label="Hora de carga" value={operacion?.hora_carga ? operacion.hora_carga.slice(0, 5) : '—'} />
                </div>

                {/* DETALLE DE LA CARGA */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Detalle de la carga
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <InfoItem icon={Apple} label="Fruta" value={fruta} />
                        <InfoItem icon={Box} label="Variedad" value={variedad} />
                        <InfoItem icon={Box} label="Tipo de jaba" value={`${tipoJaba} (${materialJaba})`} />
                        <InfoItem icon={RefreshCw} label="Jabas retornables" value={requiereRetorno ? 'Sí' : 'No'} />
                        <InfoItem icon={Package} label="Cantidad de jabas" value={cantidadJabas} />
                        <InfoItem icon={User} label="Cliente emisor" value={clienteEmisor} />
                        <InfoItem icon={Info} label="Instrucción reparto" value={instruccionReparto} />
                    </div>
                </div>

                {guia.observaciones && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Observaciones</p>
                        <p className="text-gray-800 dark:text-white/90">{guia.observaciones}</p>
                    </div>
                )}
            </div>

            {/* TABLA ÚNICA: CALIDADES DEL PUESTO */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        <Layers className="inline-block w-5 h-5 mr-2" />
                        Calidades del Puesto #{itemReparto?.puestos?.numero_puesto || '—'}
                    </h3>
                    {itemsDelPuesto.length > 1 && (
                        <Badge size="sm" color="info">
                            {itemsDelPuesto.length} items agrupados
                        </Badge>
                    )}
                </div>

                {calidadesResumen.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300 font-semibold">Calidad</th>
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300 font-semibold">Cantidad Total</th>
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300 font-semibold">Items asociados</th>
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300 font-semibold">Precio Unit.</th>
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300 font-semibold">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calidadesResumen.map((cal: any) => {
                                    const subtotal = cal.precio_unitario ? cal.cantidad_total * cal.precio_unitario : 0;
                                    const itemsText = cal.items
                                        .map((it: any) => `Item #${it.item_id} (${it.cantidad})`)
                                        .join(', ');
                                    return (
                                        <tr key={cal.nombre} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="py-2 px-3 font-medium text-gray-800 dark:text-white/90">
                                                {cal.nombre}
                                            </td>
                                            <td className="py-2 px-3 text-gray-800 dark:text-white/90">{cal.cantidad_total}</td>
                                            <td className="py-2 px-3 text-gray-800 dark:text-white/90 text-sm">
                                                <span className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-mono">
                                                    {itemsText}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-gray-800 dark:text-white/90">
                                                {cal.precio_unitario ? `S/ ${cal.precio_unitario}` : '—'}
                                            </td>
                                            <td className="py-2 px-3 font-medium text-gray-800 dark:text-white/90">
                                                {subtotal > 0 ? `S/ ${subtotal.toFixed(2)}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {totalGeneral > 0 && (
                                    <tr className="font-semibold border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30">
                                        <td colSpan={2} className="py-2 px-3 text-right text-gray-800 dark:text-white/90">
                                            Total General
                                        </td>
                                        <td className="py-2 px-3 text-gray-800 dark:text-white/90"></td>
                                        <td className="py-2 px-3 text-gray-800 dark:text-white/90"></td>
                                        <td className="py-2 px-3 text-gray-800 dark:text-white/90">
                                            S/ {totalGeneral.toFixed(2)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No hay calidades asignadas para este puesto</p>
                )}
            </div>

            {/* ===== SECCIÓN DE ENTREGA (RESUMEN) ===== */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        📦 Estado de Entrega
                    </h3>
                    {!tieneEntregas && puedeRegistrarEntrega && (
                        <Button size="sm" variant="outline" onClick={() => setEntregaModalOpen(true)}>
                            Registrar Entrega
                        </Button>
                    )}
                </div>

                {tieneEntregas ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="font-medium text-green-700 dark:text-green-300">Guía entregada</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Entregado el {formatDate(guia.entregas[0].fecha_entrega)}
                                {guia.entregas[0].hora_entrega && ` a las ${guia.entregas[0].hora_entrega.slice(0, 5)}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Recibido por: {guia.entregas[0].nombre_recibe || '—'}
                                {guia.entregas[0].usuarios?.nombres && ` (Entregador: ${guia.entregas[0].usuarios.nombres})`}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        <div>
                            <p className="font-medium text-yellow-700 dark:text-yellow-300">Pendiente de entrega</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Esta guía aún no ha sido entregada
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL PARA REGISTRAR ENTREGA */}
            <RegistrarEntregaModal
                open={entregaModalOpen}
                onOpenChange={setEntregaModalOpen}
                guia={guia}
                onSaved={fetchGuia}
            />
        </div>
    );
}

// Componente auxiliar
function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 break-words">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}