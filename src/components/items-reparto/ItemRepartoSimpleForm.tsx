'use client';

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useOpcionesFlujo } from '@/hooks/useOpcionesFlujo';
import { useItemsReparto } from '@/hooks/useItemsReparto';
import { Package, User, MapPin, DollarSign, CheckCircle } from 'lucide-react';

interface ItemRepartoSimpleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    operacionId?: number;
    defaultDetalleId?: number;
}

interface CalidadDisponible {
    id_detalle_carga_calidad: number;
    cantidad: number;
    precio_unitario?: number | null;
    calidades?: { nombre: string };
}

interface RepartoOpciones {
    detalle: {
        id_detalle_carga: number;
        cantidad_jabas: number;
        clientes?: { nombres: string };
    };
    calidades: CalidadDisponible[];
    clientes: { id_cliente: number; nombres: string; apellidos?: string | null }[];
    puestos: {
        id_puesto: number;
        codigo_puesto: string;
        lugares_operativos?: { nombre: string } | null;
    }[];
}

const normalizarOpciones = (opciones: RepartoOpciones): RepartoOpciones => ({
    ...opciones,
    detalle: {
        ...opciones.detalle,
        id_detalle_carga: Number(opciones.detalle.id_detalle_carga),
        cantidad_jabas: Number(opciones.detalle.cantidad_jabas),
    },
    calidades: opciones.calidades.map((calidad) => ({
        ...calidad,
        id_detalle_carga_calidad: Number(calidad.id_detalle_carga_calidad),
        cantidad: Number(calidad.cantidad),
    })),
    clientes: opciones.clientes.map((cliente) => ({
        ...cliente,
        id_cliente: Number(cliente.id_cliente),
    })),
    puestos: opciones.puestos.map((puesto) => ({
        ...puesto,
        id_puesto: Number(puesto.id_puesto),
    })),
});

export default function ItemRepartoSimpleForm({
    isOpen,
    onClose,
    onSuccess,
    operacionId,
    defaultDetalleId,
}: ItemRepartoSimpleFormProps) {
    const { createMultipleFromCalidades, loading } = useItemsReparto();
    const [detalleCargaId, setDetalleCargaId] = useState<number>(0);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState<RepartoOpciones['detalle'] | null>(null);
    const [calidades, setCalidades] = useState<CalidadDisponible[]>([]);
    const [cantidadesPorCalidad, setCantidadesPorCalidad] = useState<Record<number, number>>({});
    const [idClienteReceptor, setIdClienteReceptor] = useState<number>(0);
    const [idPuesto, setIdPuesto] = useState<number>(0);
    const [precioUnitario, setPrecioUnitario] = useState<string>('');
    const [optionsRetry, setOptionsRetry] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'calidad' | 'destino'>('calidad');

    const modalInicializadoRef = useRef(false);

    const { data: opciones, loading: loadingOptions, error: optionsError } = useOpcionesFlujo<RepartoOpciones>(
        'reparto',
        { operacion: operacionId, detalle: defaultDetalleId, cliente: idClienteReceptor, buscar: String(optionsRetry) },
        isOpen && !!operacionId && !!defaultDetalleId,
    );
    const opcionesNormalizadas = useMemo(
        () => opciones ? normalizarOpciones(opciones) : undefined,
        [opciones],
    );
    const [lastOptions, setLastOptions] = useState<typeof opcionesNormalizadas>();
    useEffect(() => {
        if (!isOpen) { modalInicializadoRef.current = false; setLastOptions(undefined); return; }
        if (!opcionesNormalizadas) return;
        const datos = opcionesNormalizadas;
        setLastOptions(datos);
        setDetalleCargaId(datos.detalle.id_detalle_carga);
        setDetalleSeleccionado(datos.detalle);
        setCalidades(datos.calidades);
        const inicializarCalidadUnica = !modalInicializadoRef.current;
        setCantidadesPorCalidad((prev) => {
            const disponibles: Record<number, number> = {};
            datos.calidades.forEach((calidad) => {
                const id = calidad.id_detalle_carga_calidad;
                if (prev[id] !== undefined) disponibles[id] = Math.min(prev[id], calidad.cantidad);
            });
            if (inicializarCalidadUnica && datos.calidades.length === 1) {
                const calidad = datos.calidades[0];
                disponibles[calidad.id_detalle_carga_calidad] = calidad.cantidad;
            }
            return disponibles;
        });
        if (!modalInicializadoRef.current) modalInicializadoRef.current = true;
        setIdClienteReceptor(prev => datos.clientes.some(c => c.id_cliente === prev) ? prev : 0);
        setIdPuesto(prev => datos.puestos.some(p => p.id_puesto === prev) ? prev : 0);
    }, [opcionesNormalizadas, isOpen]);
    const clientesFiltrados = (opcionesNormalizadas ?? lastOptions)?.clientes || [];
    const puestosFiltrados = (opcionesNormalizadas ?? lastOptions)?.puestos || [];
    const calidadesMarcadas = calidades.filter(
        (calidad) => cantidadesPorCalidad[calidad.id_detalle_carga_calidad] !== undefined,
    );
    const cantidadesValidas = calidadesMarcadas.length > 0 && calidadesMarcadas.every((calidad) => {
        const cantidad = cantidadesPorCalidad[calidad.id_detalle_carga_calidad];
        return Number.isInteger(cantidad) && cantidad > 0 && cantidad <= calidad.cantidad;
    });

    const resetForm = () => {
        setLastOptions(undefined);
        setDetalleCargaId(0);
        setDetalleSeleccionado(null);
        setCalidades([]);
        setCantidadesPorCalidad({});
        setIdClienteReceptor(0);
        setIdPuesto(0);
        setPrecioUnitario('');
        setError(null);
        setStep('calidad');
        modalInicializadoRef.current = false;
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const toggleCalidad = (id: number) => {
        const calidad = calidades.find((item) => item.id_detalle_carga_calidad === id);
        if (!calidad) return;
        setError(null);
        setCantidadesPorCalidad((actuales) => {
            if (actuales[id] !== undefined) {
                const siguientes = { ...actuales };
                delete siguientes[id];
                return siguientes;
            }
            return { ...actuales, [id]: calidad.cantidad };
        });
    };

    const handleNextStep = () => {
        if (!cantidadesValidas) {
            setError('Marca al menos una calidad y revisa la cantidad de cada una.');
            return;
        }
        setError(null);
        setStep('destino');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting || loading || loadingOptions || optionsError) return;
        setError(null);
        if (!calidadesMarcadas.length) {
            setError('Marca al menos una calidad.');
            return;
        }
        if (!idClienteReceptor || !idPuesto) {
            setError('Seleccione cliente y puesto');
            return;
        }
        const cantidadInvalida = calidadesMarcadas.find((calidad) => {
            const cantidad = cantidadesPorCalidad[calidad.id_detalle_carga_calidad];
            return !Number.isInteger(cantidad) || cantidad <= 0 || cantidad > calidad.cantidad;
        });
        if (cantidadInvalida) {
            setError(`La cantidad de ${cantidadInvalida.calidades?.nombre || 'una calidad'} debe ser entre 1 y ${cantidadInvalida.cantidad}.`);
            return;
        }
        const payload = {
            id_detalle_carga: detalleCargaId,
            asignaciones: [
                {
                    id_cliente_receptor: idClienteReceptor,
                    id_puesto: idPuesto,
                    detalles: calidadesMarcadas.map((calidad) => ({
                        id_detalle_carga_calidad: calidad.id_detalle_carga_calidad,
                        cantidad: cantidadesPorCalidad[calidad.id_detalle_carga_calidad],
                        precio_unitario: precioUnitario ? parseFloat(precioUnitario) : undefined,
                    })),
                },
            ],
        };

        setSubmitting(true);
        try {
            await createMultipleFromCalidades(payload);
            onSuccess();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo asignar el destino.');
        } finally { setSubmitting(false); }
    };

    const selectClassName = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="mx-4 max-h-[90dvh] max-w-lg overflow-y-auto" ariaLabel="Asignar calidades y destino">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Asignar calidades y destino</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {detalleSeleccionado
                                ? `${detalleSeleccionado.clientes?.nombres} · ${detalleSeleccionado.cantidad_jabas} jabas`
                                : 'Selecciona qué repartir'}
                        </p>
                    </div>
                </div>

                <div role="status" aria-live="polite" className="mb-2 min-h-5 text-sm text-gray-500 dark:text-gray-400">
                    {loadingOptions && lastOptions ? 'Actualizando puestos disponibles…' : ''}
                </div>
                {optionsError && (
                    <div role="alert" className="mb-3 space-y-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        <p>No se pudieron cargar los clientes y puestos. Intenta nuevamente.</p>
                        <Button type="button" variant="outline" onClick={() => setOptionsRetry((n) => n + 1)}>Reintentar carga</Button>
                    </div>
                )}
                {loadingOptions && !lastOptions ? (
                    <OperationSkeleton variant="compact" heading={false} />
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
                                1. Calidades
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
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Marca una o varias calidades y define cuántas jabas asignar de cada una.
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {calidades.map((c) => {
                                                const id = c.id_detalle_carga_calidad;
                                                const selected = cantidadesPorCalidad[id] !== undefined;
                                                return (
                                                    <div
                                                        key={id}
                                                        className={`rounded-lg border p-3 transition-colors ${
                                                            selected
                                                                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                    >
                                                        <label className="flex cursor-pointer items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selected}
                                                                onChange={() => toggleCalidad(id)}
                                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="min-w-0 flex-1">
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                    {c.calidades?.nombre}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {c.cantidad} jabas disponibles
                                                                </p>
                                                            </span>
                                                            {selected && <CheckCircle className="h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" />}
                                                        </label>
                                                        {selected && (
                                                            <div className="mt-3 flex items-end gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <Label htmlFor={`cantidad-calidad-${id}`} className="text-xs text-gray-600 dark:text-gray-300">
                                                                        Jabas para este destino
                                                                    </Label>
                                                                    <Input
                                                                        id={`cantidad-calidad-${id}`}
                                                                        type="number"
                                                                        min="1"
                                                                        max={String(c.cantidad)}
                                                                        step={1}
                                                                        value={cantidadesPorCalidad[id]}
                                                                        onChange={(event) => {
                                                                            const cantidad = Number(event.target.value);
                                                                            setError(null);
                                                                            setCantidadesPorCalidad((actuales) => ({ ...actuales, [id]: cantidad }));
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="pb-2 text-xs text-gray-500 dark:text-gray-400">
                                                                    de {c.cantidad}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {calidadesMarcadas.some((calidad) => {
                                            const cantidad = cantidadesPorCalidad[calidad.id_detalle_carga_calidad];
                                            return !Number.isInteger(cantidad) || cantidad <= 0 || cantidad > calidad.cantidad;
                                        }) && (
                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                Revisa las cantidades: cada una debe estar entre 1 y las jabas disponibles.
                                            </p>
                                        )}

                                        {error && (
                                            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                                {error}
                                            </p>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={handleNextStep}
                                            disabled={!cantidadesValidas}
                                            className="w-full"
                                        >
                                            Siguiente · {calidadesMarcadas.length} calidades
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Destino */}
                        {step === 'destino' && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="mt-2 flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            {calidadesMarcadas.map((calidad) => (
                                                <p key={calidad.id_detalle_carga_calidad} className="text-sm text-gray-700 dark:text-gray-200">
                                                    {calidad.calidades?.nombre}: <strong>{cantidadesPorCalidad[calidad.id_detalle_carga_calidad]} jabas</strong>
                                                </p>
                                            ))}
                                            <p className="pt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Total: {calidadesMarcadas.reduce((total, calidad) => total + (cantidadesPorCalidad[calidad.id_detalle_carga_calidad] || 0), 0)} jabas
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep('calidad')}
                                            className="shrink-0 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                </div>

                                {/* Cliente */}
                                <div>
                                    <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Cliente receptor
                                    </Label>
                                    {clientesFiltrados.length === 0 ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                            No hay clientes activos con relación Receptor o Ambos.
                                        </p>
                                    ) : (
                                        <>
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
                                                {clientesFiltrados.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos || ''}</option>)}
                                            </select>
                                        </>
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
                                        disabled={loadingOptions || !!optionsError || !idClienteReceptor}
                                    >
                                        <option value="">Seleccionar puesto...</option>
                                        {puestosFiltrados.map((p) => (
                                            <option key={p.id_puesto} value={p.id_puesto}>
                                                {p.codigo_puesto} - {p.lugares_operativos?.nombre || ''}
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
                                        disabled={submitting || loading || loadingOptions || !!optionsError || !idClienteReceptor || !idPuesto}
                                        className="flex-1"
                                    >
                                        {submitting ? 'Guardando…' : 'Guardar destino'}
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
