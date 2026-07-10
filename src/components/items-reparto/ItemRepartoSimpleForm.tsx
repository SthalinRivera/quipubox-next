'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useItemsReparto } from '@/hooks/useItemsReparto';
import { Package, User, MapPin, DollarSign, CheckCircle } from 'lucide-react';

interface ItemRepartoSimpleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    operacionId?: number;
    defaultDetalleId?: number;
}

export default function ItemRepartoSimpleForm({
    isOpen,
    onClose,
    onSuccess,
    operacionId,
    defaultDetalleId,
}: ItemRepartoSimpleFormProps) {
    const {
        getDetallesReparto,
        getClientes,
        getPuestos,
        getCalidadesByDetalle,
        createMultipleFromCalidades,
        detallesReparto,
        clientes: clientesRaw,
        puestos: puestosRaw,
        loading,
        loadOptions,
    } = useItemsReparto();

    const [detalleCargaId, setDetalleCargaId] = useState<number>(0);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState<any>(null);
    const [calidades, setCalidades] = useState<any[]>([]);
    const [calidadSeleccionadaId, setCalidadSeleccionadaId] = useState<number | null>(null);
    const [cantidadAsignar, setCantidadAsignar] = useState<number>(0);
    const [idClienteReceptor, setIdClienteReceptor] = useState<number>(0);
    const [idPuesto, setIdPuesto] = useState<number>(0);
    const [precioUnitario, setPrecioUnitario] = useState<string>('');
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'calidad' | 'destino'>('calidad');

    const optionsLoadedRef = useRef(false);
    const modalInicializadoRef = useRef(false);

    useEffect(() => {
        if (isOpen && !optionsLoadedRef.current) {
            setLoadingOptions(true);
            loadOptions()
                .catch(() => setError('Error al cargar opciones'))
                .finally(() => {
                    optionsLoadedRef.current = true;
                    setLoadingOptions(false);
                });
        }
    }, [isOpen, loadOptions]);

    useEffect(() => {
        if (isOpen && operacionId) {
            getDetallesReparto(operacionId);
        }
    }, [isOpen, operacionId, getDetallesReparto]);

    useEffect(() => {
        if (isOpen && defaultDetalleId && !detalleCargaId && !modalInicializadoRef.current) {
            const detalle = detallesReparto.find((d) => d.id_detalle_carga === defaultDetalleId);
            if (detalle) {
                setDetalleCargaId(defaultDetalleId);
                setDetalleSeleccionado(detalle);
                modalInicializadoRef.current = true;
            }
        }
    }, [isOpen, defaultDetalleId, detallesReparto, detalleCargaId]);

    useEffect(() => {
        if (detalleCargaId) {
            getCalidadesByDetalle(detalleCargaId).then((data) => {
                const calidadesData = Array.isArray(data) ? data : [];
                setCalidades(calidadesData);
                if (calidadesData.length === 1) {
                    setCalidadSeleccionadaId(calidadesData[0].id_detalle_carga_calidad);
                    setCantidadAsignar(calidadesData[0].cantidad);
                } else {
                    setCalidadSeleccionadaId(null);
                    setCantidadAsignar(0);
                }
            });
        } else {
            setCalidades([]);
            setCalidadSeleccionadaId(null);
            setCantidadAsignar(0);
            setDetalleSeleccionado(null);
        }
    }, [detalleCargaId, getCalidadesByDetalle]);

    const clientesFiltrados = useMemo(() => {
        if (!clientesRaw || !detalleSeleccionado) return [];
        const sedeDestinoId = detalleSeleccionado.operaciones_carga?.id_sede_destino;
        return clientesRaw.filter((cliente) => {
            const relacionesReceptor = (cliente.cliente_sede || []).filter(
                (cs: any) => cs.tipo_relacion === 'receptor' || cs.tipo_relacion === 'ambos'
            );
            if (relacionesReceptor.length === 0) return false;
            if (!sedeDestinoId) return true;
            return relacionesReceptor.some((cs: any) => cs.id_sede === sedeDestinoId);
        });
    }, [clientesRaw, detalleSeleccionado]);

    const puestosFiltrados = useMemo(() => {
        if (!puestosRaw || !idClienteReceptor) return puestosRaw || [];
        const cliente = clientesFiltrados.find((c) => c.id_cliente === idClienteReceptor);
        if (!cliente) return puestosRaw || [];
        const puestosIds = (cliente.clientes_puestos || [])
            .filter((cp: any) => cp.estado !== false)
            .map((cp: any) => cp.id_puesto);
        if (puestosIds.length === 0) return puestosRaw || [];
        return (puestosRaw || []).filter((p) => puestosIds.includes(p.id_puesto));
    }, [puestosRaw, idClienteReceptor, clientesFiltrados]);

    const calidadSeleccionada = calidades.find((c) => c.id_detalle_carga_calidad === calidadSeleccionadaId);

    const resetForm = () => {
        setDetalleCargaId(0);
        setDetalleSeleccionado(null);
        setCalidades([]);
        setCalidadSeleccionadaId(null);
        setCantidadAsignar(0);
        setIdClienteReceptor(0);
        setIdPuesto(0);
        setPrecioUnitario('');
        setError(null);
        setStep('calidad');
        modalInicializadoRef.current = false;
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleCalidadSelect = (id: number) => {
        setCalidadSeleccionadaId(id);
        const c = calidades.find((x) => x.id_detalle_carga_calidad === id);
        setCantidadAsignar(c?.cantidad || 0);
    };

    const handleNextStep = () => {
        if (!calidadSeleccionada || cantidadAsignar <= 0) {
            setError('Seleccione una calidad y cantidad válida');
            return;
        }
        setError(null);
        setStep('destino');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!calidadSeleccionada) {
            setError('Seleccione una calidad');
            return;
        }
        if (!idClienteReceptor || !idPuesto) {
            setError('Seleccione cliente y puesto');
            return;
        }
        if (cantidadAsignar <= 0 || cantidadAsignar > calidadSeleccionada.cantidad) {
            setError(`Cantidad debe ser entre 1 y ${calidadSeleccionada.cantidad}`);
            return;
        }
        const payload = {
            id_detalle_carga: detalleCargaId,
            asignaciones: [
                {
                    id_cliente_receptor: idClienteReceptor,
                    id_puesto: idPuesto,
                    detalles: [
                        {
                            id_detalle_carga_calidad: calidadSeleccionada.id_detalle_carga_calidad,
                            cantidad: cantidadAsignar,
                            precio_unitario: precioUnitario ? parseFloat(precioUnitario) : undefined,
                        },
                    ],
                },
            ],
        };

        try {
            await createMultipleFromCalidades(payload);
            onSuccess();
            resetForm();
        } catch (err) {
            setError('Error al repartir');
        }
    };

    const selectClassName = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Repartir</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {detalleSeleccionado
                                ? `${detalleSeleccionado.clientes?.nombres} · ${detalleSeleccionado.cantidad_jabas} jabas`
                                : 'Selecciona qué repartir'}
                        </p>
                    </div>
                </div>

                {loadingOptions ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando...</div>
                ) : (
                    <>
                        {/* Paso indicators */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                                step === 'calidad'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                                {step !== 'calidad' && <CheckCircle className="w-3.5 h-3.5" />}
                                1. Calidad
                            </div>
                            <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />
                            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                                step === 'destino'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                            }`}>
                                2. Destino
                            </div>
                        </div>

                        {/* STEP 1: Calidad */}
                        {step === 'calidad' && (
                            <div className="space-y-4">
                                {calidades.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                                        No hay calidades disponibles
                                    </div>
                                ) : (
                                    <>
                                        {/* Quality cards */}
                                        <div className="grid gap-2">
                                            {calidades.map((c) => {
                                                const selected = c.id_detalle_carga_calidad === calidadSeleccionadaId;
                                                const total = c.cantidad;
                                                const porcentaje = total > 0 ? 100 : 0;
                                                return (
                                                    <button
                                                        key={c.id_detalle_carga_calidad}
                                                        type="button"
                                                        onClick={() => handleCalidadSelect(c.id_detalle_carga_calidad)}
                                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                            selected
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                    {c.calidades?.nombre}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {total} jabas disponibles
                                                                </p>
                                                            </div>
                                                            {selected && (
                                                                <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Cantidad */}
                                        {calidadSeleccionada && (
                                            <div>
                                                <Label className="text-gray-700 dark:text-gray-300 text-sm">Cantidad</Label>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={calidadSeleccionada.cantidad}
                                                        value={cantidadAsignar}
                                                        onChange={(e) => setCantidadAsignar(parseInt(e.target.value) || 0)}
                                                        className="flex-1"
                                                    />
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        / {calidadSeleccionada.cantidad}
                                                    </span>
                                                </div>
                                                {/* Barra de progreso */}
                                                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all"
                                                        style={{ width: `${(cantidadAsignar / calidadSeleccionada.cantidad) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Next button */}
                                        <Button
                                            type="button"
                                            onClick={handleNextStep}
                                            disabled={!calidadSeleccionada || cantidadAsignar <= 0}
                                            className="w-full"
                                        >
                                            Siguiente
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Destino */}
                        {step === 'destino' && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Resumen de calidad seleccionada */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {calidadSeleccionada?.calidades?.nombre}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {cantidadAsignar} jabas
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep('calidad')}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Cambiar
                                    </button>
                                </div>

                                {/* Cliente */}
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Cliente receptor
                                    </Label>
                                    {clientesFiltrados.length === 0 ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                            No hay clientes receptores disponibles
                                        </p>
                                    ) : (
                                        <select
                                            className={selectClassName}
                                            value={idClienteReceptor}
                                            onChange={(e) => {
                                                setIdClienteReceptor(parseInt(e.target.value));
                                                setIdPuesto(0);
                                            }}
                                            required
                                        >
                                            <option value="">Seleccionar cliente...</option>
                                            {clientesFiltrados.map((c) => (
                                                <option key={c.id_cliente} value={c.id_cliente}>
                                                    {c.nombres} {c.apellidos || ''}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Puesto */}
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Puesto
                                    </Label>
                                    <select
                                        className={selectClassName}
                                        value={idPuesto}
                                        onChange={(e) => setIdPuesto(parseInt(e.target.value))}
                                        required
                                        disabled={!idClienteReceptor}
                                    >
                                        <option value="">Seleccionar puesto...</option>
                                        {(idClienteReceptor ? puestosFiltrados : puestosRaw || []).map((p) => (
                                            <option key={p.id_puesto} value={p.id_puesto}>
                                                {p.numero_puesto} - {p.lugares_operativos?.nombre || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Precio */}
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        Precio unitario
                                        <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step={0.01}
                                        placeholder="S/ 0.00"
                                        value={precioUnitario}
                                        onChange={(e) => setPrecioUnitario(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-3">
                                    <Button type="button" variant="outline" onClick={() => setStep('calidad')} className="flex-1">
                                        Atrás
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || !idClienteReceptor || !idPuesto}
                                        className="flex-1"
                                    >
                                        {loading ? 'Repartiendo...' : 'Repartir'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}
