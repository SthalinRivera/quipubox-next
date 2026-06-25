// components/items-reparto/ItemRepartoSimpleForm.tsx
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useItemsReparto } from '@/hooks/useItemsReparto';

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

    // Estados
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

    // Refs para control de carga de opciones y preselección
    const optionsLoadedRef = useRef(false);
    const modalInicializadoRef = useRef(false);

    // Cargar opciones globales una sola vez
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

    // Cargar detalles de reparto al abrir
    useEffect(() => {
        if (isOpen && operacionId) {
            getDetallesReparto(operacionId);
        }
    }, [isOpen, operacionId, getDetallesReparto]);

    // Preseleccionar detalle si viene defaultDetalleId
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

    // Cambio de detalle
    const handleDetalleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setDetalleCargaId(id);
        const detalle = detallesReparto.find((d) => d.id_detalle_carga === id);
        setDetalleSeleccionado(detalle || null);
        // Limpiar estados dependientes
        setCalidadSeleccionadaId(null);
        setCantidadAsignar(0);
        setIdClienteReceptor(0);
        setIdPuesto(0);
        setPrecioUnitario('');
    };

    // Cargar calidades al cambiar detalle
    useEffect(() => {
        if (detalleCargaId) {
            getCalidadesByDetalle(detalleCargaId).then((data) => {
                const calidadesData = Array.isArray(data) ? data : [];
                setCalidades(calidadesData);
                if (calidadesData.length > 0) {
                    const primera = calidadesData[0];
                    setCalidadSeleccionadaId(primera.id_detalle_carga_calidad);
                    setCantidadAsignar(primera.cantidad);
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

    // ======== FILTROS ========
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

    // Handlers
    const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setIdClienteReceptor(id);
        setIdPuesto(0);
    };

    const handleCalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setCalidadSeleccionadaId(id);
        const calidad = calidades.find((c) => c.id_detalle_carga_calidad === id);
        if (calidad) {
            setCantidadAsignar(calidad.cantidad);
        } else {
            setCantidadAsignar(0);
        }
    };

    const calidadSeleccionada = calidades.find((c) => c.id_detalle_carga_calidad === calidadSeleccionadaId);

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!calidadSeleccionada) {
            setError('Seleccione una calidad');
            return;
        }
        if (!idClienteReceptor || !idPuesto) {
            setError('Complete cliente y puesto');
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
            // Resetear campos
            setCalidadSeleccionadaId(null);
            setIdClienteReceptor(0);
            setIdPuesto(0);
            setCantidadAsignar(0);
            setPrecioUnitario('');
            onSuccess();
        } catch (err) {
            setError('Error al asignar la calidad');
        }
    };

    // Estilos para selects (oscuro/claro)
    const selectClassName = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Asignar Calidad a Cliente
                </h2>
                {loadingOptions ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando opciones...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Detalle */}
                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Detalle de carga *</Label>
                            <select
                                className={selectClassName}
                                value={detalleCargaId}
                                onChange={handleDetalleChange}
                                required
                            >
                                <option value="">Seleccione un detalle</option>
                                {detallesReparto.map((d) => (
                                    <option key={d.id_detalle_carga} value={d.id_detalle_carga}>
                                        #{d.id_detalle_carga} - {d.clientes?.nombres} - {d.cantidad_jabas} jabas
                                        {d.operaciones_carga?.id_sede_destino && (
                                            <span className="text-xs text-gray-400 ml-1">
                                                (Sede: {d.operaciones_carga?.sedes_operaciones_carga_id_sede_destinoTosedes?.nombre || 'N/A'})
                                            </span>
                                        )}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Calidad */}
                        {calidades.length > 0 && (
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Calidad *</Label>
                                <select
                                    className={selectClassName}
                                    value={calidadSeleccionadaId || ''}
                                    onChange={handleCalidadChange}
                                    required
                                >
                                    <option value="">Seleccione una calidad</option>
                                    {calidades.map((c) => (
                                        <option key={c.id_detalle_carga_calidad} value={c.id_detalle_carga_calidad}>
                                            {c.calidades?.nombre || 'Sin nombre'} (Disponible: {c.cantidad})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {calidadSeleccionada && (
                            <>
                                {/* Cantidad */}
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Cantidad a asignar *</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            max={calidadSeleccionada.cantidad}
                                            value={cantidadAsignar}
                                            onChange={(e) => setCantidadAsignar(parseInt(e.target.value) || 0)}
                                            required
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            / {calidadSeleccionada.cantidad}
                                        </span>
                                    </div>
                                </div>

                                {/* Cliente */}
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Cliente receptor *</Label>
                                    {clientesFiltrados.length === 0 ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                            No hay clientes receptores disponibles para esta operación.
                                        </p>
                                    ) : (
                                        <select
                                            className={selectClassName}
                                            value={idClienteReceptor}
                                            onChange={handleClienteChange}
                                            required
                                        >
                                            <option value="">Seleccione un cliente</option>
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
                                    <Label className="text-gray-700 dark:text-gray-300">Puesto *</Label>
                                    {idClienteReceptor && puestosFiltrados.length === 0 ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                            Este cliente no tiene puestos asignados.
                                        </p>
                                    ) : (
                                        <select
                                            className={selectClassName}
                                            value={idPuesto}
                                            onChange={(e) => setIdPuesto(parseInt(e.target.value))}
                                            required
                                            disabled={!idClienteReceptor}
                                        >
                                            <option value="">Seleccione un puesto</option>
                                            {(idClienteReceptor ? puestosFiltrados : puestosRaw || []).map((p) => (
                                                <option key={p.id_puesto} value={p.id_puesto}>
                                                    {p.numero_puesto} - {p.lugares_operativos?.nombre || ''}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Precio */}
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300">Precio unitario (opcional)</Label>
                                    <Input
                                        type="number"
                                        step={0.01}
                                        value={precioUnitario}
                                        onChange={(e) => setPrecioUnitario(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !calidadSeleccionada || !idClienteReceptor || !idPuesto}
                            >
                                {loading ? 'Guardando...' : 'Asignar esta calidad'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}