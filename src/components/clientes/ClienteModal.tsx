'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClientes } from '@/hooks/useClientes';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useSedes } from '@/hooks/useSedes';
import { useLugarOperativo } from '@/hooks/useLugarOperativo';
import { usePuestos } from '@/hooks/usePuestos';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import { Check, ChevronRight, ChevronLeft, Building2, LayoutGrid, User, Plus, Trash2, X } from 'lucide-react';
import type { Cliente } from '@/types/cliente';
import type { Puesto } from '@/types/puesto';

// Esquema paso 1 – solo nombres, apellidos y empresa obligatorios
const clienteSchema = z.object({
    nombres: z.string().min(1, 'Requerido'),
    apellidos: z.string().min(1, 'Requerido'),
    apodo: z.string().optional(),
    telefono: z
        .string()
        .optional()
        .refine((val) => !val || /^[0-9]{9,15}$/.test(val), '9 a 15 dígitos'),
    observaciones: z.string().optional(),
    id_empresa: z.number().min(1, 'Seleccione una empresa'),
});
type ClienteFormData = z.infer<typeof clienteSchema>;

interface SedeAsignada {
    id_sede: number;
    nombre: string;
    tipo_relacion: string;
}

interface PuestoAsignado {
    id_puesto: number;
    seccion: string;
    nombreMercado?: string;
    numeroPuesto?: string;
}

const SECCIONES = ['A', 'B', 'C'];
const seccionOptions = SECCIONES.map(s => ({ value: s, label: `Sección ${s}` }));
const tipoRelacionOptions = [
    { value: 'emisor', label: '📤 Emisor' },
    { value: 'receptor', label: '📥 Receptor' },
    { value: 'ambos', label: '🔄 Ambos' },
];

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCliente?: Cliente | null;
    onSaved: () => void;
}

export function ClienteModal({ open, onOpenChange, editingCliente, onSaved }: Props) {
    const {
        create, update,
        fetchSedesByCliente, assignSede, removeSede,
        fetchPuestosByCliente, assignPuesto, removePuesto,
    } = useClientes();
    const { empresas, fetchAll: fetchEmpresas } = useEmpresas();
    const { sedes, fetchAll: fetchSedes } = useSedes();
    const { lugares, fetchAll: fetchLugares } = useLugarOperativo();
    const toast = useToast();

    // Stepper
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Formulario datos básicos
    const { control, handleSubmit, reset, watch, formState: { errors, isValid, isSubmitting } } = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
        defaultValues: { nombres: '', apellidos: '', apodo: '', telefono: '', observaciones: '', id_empresa: 0 },
        mode: 'onChange',
    });
    const empresaId = watch('id_empresa');

    // Sedes (paso 2)
    const [sedesAsignadas, setSedesAsignadas] = useState<SedeAsignada[]>([]);
    const [newSedeId, setNewSedeId] = useState<number>(0);
    const [newTipoRelacion, setNewTipoRelacion] = useState('emisor');
    const [cargandoSedes, setCargandoSedes] = useState(false);

    // Puestos (paso 3)
    const [selectedSedeId, setSelectedSedeId] = useState<number>(0);
    const [selectedMercadoId, setSelectedMercadoId] = useState<number>(0);
    const [selectedPuestoId, setSelectedPuestoId] = useState<number>(0);
    const [selectedSeccion, setSelectedSeccion] = useState('');
    const [puestosAsignados, setPuestosAsignados] = useState<PuestoAsignado[]>([]);
    const [cargandoPuestos, setCargandoPuestos] = useState(false);
    const [puestosPorMercado, setPuestosPorMercado] = useState<Puesto[]>([]);
    const [cargandoPuestosMercado, setCargandoPuestosMercado] = useState(false);

    // Carga catálogos
    useEffect(() => {
        if (open) {
            fetchEmpresas();
            if (empresaId) {
                fetchSedes();
                fetchLugares();
            }
        }
    }, [open, empresaId, fetchEmpresas, fetchSedes, fetchLugares]);

    // Cargar asignaciones existentes al editar
    useEffect(() => {
        if (open && editingCliente) {
            const cargar = async () => {
                setCargandoSedes(true);
                setCargandoPuestos(true);
                try {
                    const sedesData = await fetchSedesByCliente(editingCliente.id_cliente);
                    setSedesAsignadas(sedesData.map((s: any) => ({
                        id_sede: s.id_sede,
                        nombre: s.sedes?.nombre || '',
                        tipo_relacion: s.tipo_relacion,
                    })));
                    const puestosData = await fetchPuestosByCliente(editingCliente.id_cliente);
                    setPuestosAsignados(puestosData.map((p: any) => ({
                        id_puesto: p.id_puesto,
                        seccion: p.seccion,
                        nombreMercado: p.puestos?.lugares_operativos?.nombre,
                        numeroPuesto: p.puestos?.numero_puesto,
                    })));
                } catch (e) { console.error(e); }
                finally { setCargandoSedes(false); setCargandoPuestos(false); }
            };
            cargar();
        } else if (open && !editingCliente) {
            setSedesAsignadas([]);
            setPuestosAsignados([]);
        }
    }, [open, editingCliente, fetchSedesByCliente, fetchPuestosByCliente]);

    // Resetear formulario al abrir
    useEffect(() => {
        if (open) {
            if (editingCliente) {
                reset({
                    nombres: editingCliente.nombres ?? '',
                    apellidos: editingCliente.apellidos ?? '',
                    apodo: editingCliente.apodo ?? '',
                    telefono: editingCliente.telefono ?? '',
                    observaciones: editingCliente.observaciones ?? '',
                    id_empresa: editingCliente.id_empresa ?? 0,
                });
            } else {
                reset({ nombres: '', apellidos: '', apodo: '', telefono: '', observaciones: '', id_empresa: 0 });
            }
            setStep(1);
        }
    }, [open, editingCliente, reset]);

    // Opciones paso 2
    const sedesDisponibles = useMemo(() => {
        return sedes.filter(s => s.id_empresa === empresaId && !sedesAsignadas.some(as => as.id_sede === s.id_sede));
    }, [sedes, empresaId, sedesAsignadas]);

    // Opciones paso 3
    const sedesAsignadasOpciones = useMemo(() => sedesAsignadas.map(s => ({ value: s.id_sede.toString(), label: s.nombre })), [sedesAsignadas]);
    const mercadosPorSede = useMemo(() => {
        if (!selectedSedeId) return [];
        return lugares.filter(l => l.tipo_lugar === 'mercado' && l.id_sede === selectedSedeId);
    }, [lugares, selectedSedeId]);
    const mercadosOptions = useMemo(() => mercadosPorSede.map(m => ({ value: m.id_lugar.toString(), label: m.nombre })), [mercadosPorSede]);

    // Cargar puestos al cambiar mercado
    useEffect(() => {
        if (selectedMercadoId) {
            const cargar = async () => {
                setCargandoPuestosMercado(true);
                try {
                    const data = await fetchWithAuth<Puesto[]>(`puestos/mercado/${selectedMercadoId}`);
                    setPuestosPorMercado(data);
                } catch (error) {
                    console.error(error);
                    setPuestosPorMercado([]);
                } finally {
                    setCargandoPuestosMercado(false);
                }
            };
            cargar();
        } else {
            setPuestosPorMercado([]);
        }
    }, [selectedMercadoId]);

    const puestosOptions = useMemo(() => puestosPorMercado.map(p => ({
        value: p.id_puesto.toString(),
        label: p.numero_puesto || 'Sin número',
    })), [puestosPorMercado]);

    // Limpiar selección al cambiar sede
    useEffect(() => {
        setSelectedMercadoId(0);
        setSelectedPuestoId(0);
    }, [selectedSedeId]);

    // Acciones de sedes
    const agregarSede = () => {
        if (!newSedeId) return toast.warning('Seleccione una sede');
        const sede = sedes.find(s => s.id_sede === newSedeId);
        if (!sede) return;
        setSedesAsignadas(prev => [...prev, { id_sede: newSedeId, nombre: sede.nombre, tipo_relacion: newTipoRelacion }]);
        setNewSedeId(0);
        setNewTipoRelacion('emisor');
    };
    const eliminarSede = (id: number) => {
        setSedesAsignadas(prev => prev.filter(s => s.id_sede !== id));
        if (selectedSedeId === id) setSelectedSedeId(0);
    };

    // Acciones de puestos
    const agregarPuesto = () => {
        if (!selectedSedeId || !selectedMercadoId || !selectedPuestoId || !selectedSeccion) {
            return toast.warning('Complete todos los campos');
        }
        if (puestosAsignados.some(p => p.id_puesto === selectedPuestoId)) {
            return toast.warning('Puesto ya asignado');
        }
        const puesto = puestosPorMercado.find(p => p.id_puesto === selectedPuestoId);
        const mercado = lugares.find(l => l.id_lugar === selectedMercadoId);
        setPuestosAsignados(prev => [...prev, {
            id_puesto: selectedPuestoId,
            seccion: selectedSeccion,
            nombreMercado: mercado?.nombre,
            numeroPuesto: puesto?.numero_puesto,
        }]);
        setSelectedMercadoId(0);
        setSelectedPuestoId(0);
        setSelectedSeccion('');
    };
    const eliminarPuesto = (id: number) => setPuestosAsignados(prev => prev.filter(p => p.id_puesto !== id));

    // Envío final (SOLO se ejecuta al hacer clic en "Crear/Actualizar")
    const onSubmit = async (data: ClienteFormData) => {
        try {
            const payload = {
                // Datos básicos
                nombres: data.nombres,
                apellidos: data.apellidos,
                apodo: data.apodo?.trim() === '' ? null : data.apodo,
                telefono: data.telefono?.trim() === '' ? null : data.telefono,
                observaciones: data.observaciones?.trim() === '' ? null : data.observaciones,
                id_empresa: data.id_empresa,
                estado: true,
                // Arrays de relaciones (tal como los tienes en los estados)
                sedes: sedesAsignadas.map(s => ({ id_sede: s.id_sede, tipo_relacion: s.tipo_relacion })),
                puestos: puestosAsignados.map(p => ({ id_puesto: p.id_puesto, seccion: p.seccion })),
            };

            if (editingCliente) {
                // Actualización completa (PUT)
                await fetchWithAuth(`clientes/${editingCliente.id_cliente}/full`, {
                    method: 'PUT',
                    body: payload,
                });
                toast.success('Cliente actualizado correctamente');
            } else {
                // Creación completa (POST)
                await fetchWithAuth('clientes/full', {
                    method: 'POST',
                    body: payload,
                });
                toast.success('Cliente creado correctamente');
            }

            onSaved();   // refrescar lista o lo que corresponda
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error al guardar');
        }
    };

    // Validar paso actual
    const isStepValid = () => {
        if (step === 1) return isValid;
        return true; // pasos 2 y 3 siempre permiten avanzar
    };

    // Prevenir envío con Enter
    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
        }
    };

    const steps = [
        { id: 1, label: 'Datos básicos', icon: User },
        { id: 2, label: 'Sedes', icon: Building2 },
        { id: 3, label: 'Puestos', icon: LayoutGrid },
    ];

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-4xl p-0 sm:p-0 dark:bg-gray-900 overflow-hidden">
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                {/* Header con stepper */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
                        </h3>
                        <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        {steps.map((s, idx) => (
                            <div key={s.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${step >= s.id ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'}
                  `}>
                                        {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{s.label}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulario – solo contiene los campos y el botón de envío (en paso 3) */}
                <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="p-6 space-y-6">
                    {/* Paso 1: Datos básicos */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Nombres *</Label>
                                <Controller name="nombres" control={control} render={({ field }) => (
                                    <Input {...field} error={!!errors.nombres} className="dark:bg-gray-800 dark:border-gray-700" />
                                )} />
                                {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres.message}</p>}
                            </div>
                            <div>
                                <Label>Apellidos *</Label>
                                <Controller name="apellidos" control={control} render={({ field }) => (
                                    <Input {...field} error={!!errors.apellidos} className="dark:bg-gray-800 dark:border-gray-700" />
                                )} />
                                {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos.message}</p>}
                            </div>
                            <div>
                                <Label>Apodo</Label>
                                <Controller name="apodo" control={control} render={({ field }) => (
                                    <Input {...field} error={!!errors.apodo} className="dark:bg-gray-800 dark:border-gray-700" />
                                )} />
                                {errors.apodo && <p className="text-red-500 text-xs mt-1">{errors.apodo.message}</p>}
                            </div>
                            <div>
                                <Label>Teléfono</Label>
                                <Controller name="telefono" control={control} render={({ field }) => (
                                    <Input type="tel" {...field} error={!!errors.telefono} className="dark:bg-gray-800 dark:border-gray-700" />
                                )} />
                                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Empresa *</Label>
                                <Controller name="id_empresa" control={control} render={({ field }) => (
                                    <Select
                                        options={empresas.map(e => ({ value: e.id_empresa.toString(), label: e.razon_social }))}
                                        placeholder="Seleccionar empresa"
                                        value={field.value ? field.value.toString() : ''}
                                        onChange={(val) => field.onChange(Number(val))}
                                        className="dark:bg-gray-800 dark:border-gray-700"
                                    />
                                )} />
                                {errors.id_empresa && <p className="text-red-500 text-xs mt-1">{errors.id_empresa.message}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Observaciones</Label>
                                <Controller name="observaciones" control={control} render={({ field }) => (
                                    <TextArea {...field} rows={2} className="dark:bg-gray-800 dark:border-gray-700" />
                                )} />
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Sedes */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <Label className="text-base font-semibold">📍 Sedes asignadas</Label>
                                {cargandoSedes ? (
                                    <p className="text-sm text-gray-500">Cargando...</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700 mt-2">
                                        {sedesAsignadas.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic text-center py-2">Sin sedes asignadas</p>
                                        ) : (
                                            sedesAsignadas.map(s => (
                                                <div key={s.id_sede} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700/30 rounded-md border">
                                                    <div>
                                                        <p className="font-medium">{s.nombre}</p>
                                                        <p className="text-xs text-gray-500">{tipoRelacionOptions.find(o => o.value === s.tipo_relacion)?.label}</p>
                                                    </div>
                                                    <button type="button" onClick={() => eliminarSede(s.id_sede)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="border-t pt-4 dark:border-gray-700">
                                <Label className="mb-2 block">➕ Agregar nueva sede</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Select
                                        options={sedesDisponibles.map(s => ({ value: s.id_sede.toString(), label: s.nombre }))}
                                        placeholder="Seleccionar sede"
                                        value={newSedeId ? newSedeId.toString() : ''}
                                        onChange={(v) => setNewSedeId(Number(v))}
                                        disabled={!empresaId}
                                    />
                                    <Select options={tipoRelacionOptions} value={newTipoRelacion} onChange={setNewTipoRelacion} />
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={agregarSede} className="mt-2 w-full">
                                    <Plus className="w-4 h-4 mr-1" /> Agregar sede
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Puestos */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div>
                                <Label className="text-base font-semibold">🏬 Puestos asignados</Label>
                                {cargandoPuestos ? (
                                    <p className="text-sm text-gray-500">Cargando...</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700 mt-2">
                                        {puestosAsignados.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic text-center py-2">Sin puestos asignados</p>
                                        ) : (
                                            puestosAsignados.map(p => (
                                                <div key={p.id_puesto} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700/30 rounded-md border">
                                                    <div>
                                                        <p className="font-medium">{p.nombreMercado} — Puesto {p.numeroPuesto}</p>
                                                        <p className="text-xs text-gray-500">Sección {p.seccion}</p>
                                                    </div>
                                                    <button type="button" onClick={() => eliminarPuesto(p.id_puesto)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {sedesAsignadas.length === 0 ? (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
                                    ⚠️ Primero asigne al menos una sede en el paso anterior.
                                </div>
                            ) : (
                                <div className="border-t pt-4 dark:border-gray-700">
                                    <Label className="mb-2 block">➕ Asignar nuevo puesto</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <Select
                                            options={sedesAsignadasOpciones}
                                            placeholder="Sede"
                                            value={selectedSedeId ? selectedSedeId.toString() : ''}
                                            onChange={(v) => setSelectedSedeId(Number(v))}
                                        />
                                        <Select
                                            options={mercadosOptions}
                                            placeholder="Mercado"
                                            value={selectedMercadoId ? selectedMercadoId.toString() : ''}
                                            onChange={(v) => setSelectedMercadoId(Number(v))}
                                            disabled={!selectedSedeId}
                                        />
                                        <Select
                                            options={puestosOptions}
                                            placeholder="Puesto"
                                            value={selectedPuestoId ? selectedPuestoId.toString() : ''}
                                            onChange={(v) => setSelectedPuestoId(Number(v))}
                                            disabled={!selectedMercadoId || cargandoPuestosMercado}
                                        />
                                        <Select options={seccionOptions} placeholder="Sección" value={selectedSeccion} onChange={setSelectedSeccion} />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={agregarPuesto}
                                        className="mt-2 w-full"
                                        disabled={!selectedSedeId || !selectedMercadoId || !selectedPuestoId || !selectedSeccion}
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Agregar puesto
                                    </Button>
                                </div>
                            )}

                            {/* Botón de envío dentro del formulario (solo visible en paso 3) */}
                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button type="submit" size="sm" disabled={isSubmitting}>
                                    {isSubmitting ? 'Guardando...' : (editingCliente ? 'Actualizar' : 'Crear')}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Botones de navegación FUERA del formulario */}
                <div className="flex justify-between p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStep(step === 1 ? 1 : (step - 1) as 1 | 2 | 3)}
                        disabled={step === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    {step < 3 && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                            disabled={!isStepValid()}
                        >
                            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}