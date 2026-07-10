'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Printer, ArrowLeft } from 'lucide-react';
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
    const porcentajeEntregado = totalAsignado > 0 ? Math.min(100, Math.round((totalEntregado / totalAsignado) * 100)) : 0;

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
    const formatHora = (hora: any): string => {
        if (!hora) return '—';
        if (typeof hora === 'string') {
            // Si contiene "T", es un datetime completo tipo ISO
            if (hora.includes('T')) {
                const timePart = hora.split('T')[1];
                return timePart ? timePart.slice(0, 5) : '—';
            }
            // Si empieza con dígitos y tiene guión, podría ser "1970-01-01..." sin T
            if (/^\d{4}-/.test(hora)) {
                // Intentar extraer hora de un formato como "1970-01-01 14:30:00"
                const parts = hora.split(' ');
                if (parts.length > 1) return parts[1].slice(0, 5);
                return '—';
            }
            // Si es solo hora "14:30:00" o "14:30"
            return hora.slice(0, 5);
        }
        if (hora instanceof Date) return hora.toTimeString().slice(0, 5);
        if (typeof hora === 'object' && hora !== null) {
            if (typeof hora.toISOString === 'function') {
                return hora.toISOString().slice(11, 16);
            }
        }
        return '—';
    };
    return (
        <div className="space-y-6 print:space-y-2">
            {/* CABECERA */}
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <Button variant="outline" size="sm" onClick={handleVolver}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
                <div className="flex flex-wrap gap-2">
                    <PDFDownloadLink
                        document={<GuiaPDF guia={guia} empresa={guia.empresas} logoUrl="/logo.png" />}
                        fileName={`guia-${guia.numero_guia}.pdf`}
                    >
                        {({ loading }) => (
                            <Button size="sm" variant="outline" disabled={loading}>
                                <Printer className="w-4 h-4 mr-2" />
                                {loading ? 'Generando...' : 'Imprimir'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                    {puedeFirmar && (
                        <Button size="sm" onClick={handleFirmar}>
                            Firmar guía
                        </Button>
                    )}
                    {puedeRegistrarEntrega && !tieneEntregas && (
                        <Button size="sm" variant="outline" onClick={() => setEntregaModalOpen(true)}>
                            Registrar Entrega
                        </Button>
                    )}
                </div>
            </div>

            {/* TARJETA ÚNICA: TODO EL DETALLE */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                {/* HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Guía #{guia.numero_guia}
                            </h2>
                            <Badge size="sm" color={ESTADO_COLOR[guia.estado] || 'secondary'}>
                                {guia.estado}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Emitida el {formatDate(guia.fecha_emision)}
                        </p>
                    </div>
                    {porcentajeEntregado > 0 && (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{porcentajeEntregado}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">entregado</div>
                        </div>
                    )}
                </div>

                {/* CUERPO: GRID COMPACTO */}
                <div className="px-6 py-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
                        <Field label="Repartidor" value={guia.usuarios?.nombres || '—'} />
                        <Field label="Empresa" value={guia.empresas?.razon_social || '—'} />
                        <Field label="Puesto" value={itemReparto?.puestos?.numero_puesto || '—'} />
                        <Field label="Cliente receptor" value={clientesAgrupados.join(', ') || '—'} />
                        <Field label="Operación" value={
                            operacion?.id_operacion ? (
                                <button onClick={() => router.push(`/dashboard/operaciones-carga/${operacion.id_operacion}`)}
                                    className="text-blue-600 hover:underline dark:text-blue-400 font-medium">
                                    #{operacion.id_operacion}
                                </button>
                            ) : '—'
                        } />
                        <Field label="Camión" value={operacion?.camiones?.placa || '—'} />
                        <Field label="Sede origen" value={operacion?.sedes_operaciones_carga_id_sede_origenTosedes?.nombre || '—'} />
                        <Field label="Sede destino" value={operacion?.sedes_operaciones_carga_id_sede_destinoTosedes?.nombre || '—'} />
                        <Field label="Fecha de carga" value={operacion?.fecha_carga ? formatDate(operacion.fecha_carga) : '—'} />
                        <Field label="Hora de carga" value={formatHora(operacion?.hora_carga)} />
                        <Field label="Items asignados" value={itemsDelPuesto.length} />
                        <Field label="Entregado / Rechazado" value={`${totalEntregado} / ${totalRechazado}`} />
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/[0.05] my-5" />

                    {/* DETALLE DE CARGA */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                            Detalle de carga
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
                            <Field label="Fruta" value={fruta} />
                            <Field label="Variedad" value={variedad} />
                            <Field label="Tipo de jaba" value={`${tipoJaba} (${materialJaba})`} />
                            <Field label="Jabas retornables" value={requiereRetorno ? 'Sí' : 'No'} />
                            <Field label="Cantidad de jabas" value={cantidadJabas} />
                            <Field label="Cliente emisor" value={clienteEmisor} />
                            <Field label="Instrucción" value={instruccionReparto} />
                        </div>
                    </div>

                    {guia.observaciones && (
                        <div className="border-t border-gray-100 dark:border-white/[0.05] mt-5 pt-5">
                            <Field label="Observaciones" value={guia.observaciones} />
                        </div>
                    )}
                </div>
            </div>

            {/* TABLA DE CALIDADES */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Calidades — Puesto {itemReparto?.puestos?.numero_puesto || '—'}
                    </h3>
                    {itemsDelPuesto.length > 1 && (
                        <Badge size="sm" color="info">{itemsDelPuesto.length} items</Badge>
                    )}
                </div>
                <div className="p-6">
                    {calidadesResumen.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Calidad</th>
                                        <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                                        <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio unit.</th>
                                        <th className="text-right py-2 pl-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calidadesResumen.map((cal: any) => {
                                        const subtotal = cal.precio_unitario ? cal.cantidad_total * cal.precio_unitario : 0;
                                        const itemsText = cal.items.map((it: any) => `#${it.item_id} (${it.cantidad})`).join(', ');
                                        return (
                                            <tr key={cal.nombre} className="border-b border-gray-50 dark:border-white/[0.02]">
                                                <td className="py-2.5 pr-4 font-medium text-gray-800 dark:text-white/90">{cal.nombre}</td>
                                                <td className="py-2.5 px-4 text-right text-gray-800 dark:text-white/90">{cal.cantidad_total}</td>
                                                <td className="py-2.5 px-4 text-xs text-gray-500 dark:text-gray-400">{itemsText}</td>
                                                <td className="py-2.5 px-4 text-right text-gray-800 dark:text-white/90 font-mono text-xs">
                                                    {cal.precio_unitario ? `S/ ${cal.precio_unitario}` : '—'}
                                                </td>
                                                <td className="py-2.5 pl-4 text-right text-gray-800 dark:text-white/90 font-medium font-mono text-xs">
                                                    {subtotal > 0 ? `S/ ${subtotal.toFixed(2)}` : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {totalGeneral > 0 && (
                                        <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                                            <td className="py-3 pr-4 font-semibold text-gray-800 dark:text-white/90">Total</td>
                                            <td className="py-3 px-4 text-right font-semibold text-gray-800 dark:text-white/90">
                                                {calidadesResumen.reduce((s: number, c: any) => s + c.cantidad_total, 0)}
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td className="py-3 pl-4 text-right font-semibold text-gray-800 dark:text-white/90 font-mono">
                                                S/ {totalGeneral.toFixed(2)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">Sin calidades asignadas</p>
                    )}
                </div>
            </div>

            {/* ESTADO DE ENTREGA */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] print:shadow-none print:border-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Entrega
                    </h3>
                    {!tieneEntregas && puedeRegistrarEntrega && (
                        <Button size="sm" variant="outline" onClick={() => setEntregaModalOpen(true)}>
                            Registrar Entrega
                        </Button>
                    )}
                </div>
                <div className="p-6">
                    {tieneEntregas ? (
                        <div className="flex items-start gap-4">
                            <div className="w-1 h-12 bg-green-500 rounded-full flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-green-700 dark:text-green-300">Entregada</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                    {formatDate(guia.entregas[0].fecha_entrega)}
                                    {guia.entregas[0].hora_entrega && ` — ${guia.entregas[0].hora_entrega.slice(0, 5)}`}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Recibió: <span className="font-medium text-gray-700 dark:text-gray-300">{guia.entregas[0].nombre_recibe || '—'}</span>
                                    {guia.entregas[0].usuarios?.nombres && ` · Entregó: ${guia.entregas[0].usuarios.nombres}`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4">
                            <div className="w-1 h-12 bg-amber-400 rounded-full flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-amber-700 dark:text-amber-300">Pendiente</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Esta guía aún no ha sido entregada
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RegistrarEntregaModal
                open={entregaModalOpen}
                onOpenChange={setEntregaModalOpen}
                guia={guia}
                onSaved={fetchGuia}
            />
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 break-words mt-0.5">
                {value ?? '—'}
            </p>
        </div>
    );
}