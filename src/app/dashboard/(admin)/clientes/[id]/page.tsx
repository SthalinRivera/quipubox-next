'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    Edit3,
    Save,
    X,
    Power,
    Play,
    Plus,
    Trash2,
    MapPin,
    Building2,
    LayoutGrid,
    User,
    Phone,
    Hash,
    LucideIcon,
} from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { useSedes } from '@/hooks/useSedes';
import { useLugarOperativo } from '@/hooks/useLugarOperativo';
import { usePuestos } from '@/hooks/usePuestos';
import { useToast } from '@/hooks/useToast';
import { fetchWithAuth } from '@/lib/api-client';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import type { Cliente, ClienteSede, ClientePuesto } from '@/types/cliente';

// Esquema de validación (igual)
const clienteSchema = z.object({
    nombres: z.string().min(1, 'Requerido'),
    apellidos: z.string().min(1, 'Requerido'),
    apodo: z.string().min(1, 'Requerido'),
    telefono: z.string().min(1, 'Requerido').regex(/^[0-9]{9,15}$/, '9 a 15 dígitos'),
    observaciones: z.string().optional(),
});
type ClienteFormData = z.infer<typeof clienteSchema>;

const tipoRelacionOptions = [
    { value: 'emisor', label: '📤 Emisor' },
    { value: 'receptor', label: '📥 Receptor' },
    { value: 'ambos', label: '🔄 Ambos' },
];
const SECCIONES = ['A', 'B', 'C'];
const seccionOptions = SECCIONES.map(s => ({ value: s, label: `Sección ${s}` }));

export default function ClienteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clienteId = Number(params.id);
    const { update, toggleEstado } = useClientes();
    const { sedes, fetchAll: fetchAllSedes } = useSedes();
    const { lugares, fetchAll: fetchAllLugares } = useLugarOperativo();
    const { puestos, fetchAll: fetchAllPuestos } = usePuestos();
    const toast = useToast();

    // Estados
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingBasic, setEditingBasic] = useState(false);
    const [sedesAsignadas, setSedesAsignadas] = useState<ClienteSede[]>([]);
    const [puestosAsignados, setPuestosAsignados] = useState<ClientePuesto[]>([]);
    const [activeTab, setActiveTab] = useState<'basico' | 'sedes' | 'puestos'>('basico');

    // Formulario edición
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
    });

    // Estados para sedes
    const [newSedeId, setNewSedeId] = useState<number>(0);
    const [newTipoRelacion, setNewTipoRelacion] = useState('emisor');
    const [addingSede, setAddingSede] = useState(false);

    // Estados para puestos
    const [selectedSedeId, setSelectedSedeId] = useState<number>(0);
    const [selectedMercadoId, setSelectedMercadoId] = useState<number>(0);
    const [selectedPuestoId, setSelectedPuestoId] = useState<number>(0);
    const [selectedSeccion, setSelectedSeccion] = useState('');
    const [addingPuesto, setAddingPuesto] = useState(false);
    const [puestosDelMercado, setPuestosDelMercado] = useState<any[]>([]);
    const [cargandoPuestosMercado, setCargandoPuestosMercado] = useState(false);

    // Cargar datos
    const loadClientData = useCallback(async () => {
        if (!clienteId) return;
        setLoading(true);
        try {
            const [clienteData, sedesData, puestosData] = await Promise.all([
                fetchWithAuth<Cliente>(`clientes/${clienteId}`),
                fetchWithAuth<ClienteSede[]>(`clientes/${clienteId}/sedes`),
                fetchWithAuth<ClientePuesto[]>(`clientes/${clienteId}/puestos`),
            ]);
            setCliente(clienteData);
            setSedesAsignadas(sedesData);
            setPuestosAsignados(puestosData);
            reset({
                nombres: clienteData.nombres,
                apellidos: clienteData.apellidos || '',
                apodo: clienteData.apodo || '',
                telefono: clienteData.telefono || '',
                observaciones: clienteData.observaciones || '',
            });
        } catch (err: any) {
            setError(err.message || 'Error al cargar el cliente');
        } finally {
            setLoading(false);
        }
    }, [clienteId, reset]);

    useEffect(() => {
        if (clienteId) {
            loadClientData();
            fetchAllSedes();
            fetchAllLugares();
            fetchAllPuestos();
        }
    }, [clienteId, loadClientData, fetchAllSedes, fetchAllLugares, fetchAllPuestos]);

    // Guardar datos básicos
    const onSaveBasic = async (data: ClienteFormData) => {
        try {
            await update(clienteId, { ...data, id_empresa: cliente!.id_empresa });
            toast.success('Datos actualizados');
            setEditingBasic(false);
            loadClientData();
        } catch (err: any) {
            toast.error(err.message || 'Error al actualizar');
        }
    };

    const handleToggleEstado = async () => {
        if (!cliente) return;
        try {
            await toggleEstado(cliente.id_cliente, !cliente.estado);
            toast.success(`Cliente ${!cliente.estado ? 'activado' : 'desactivado'}`);
            loadClientData();
        } catch (err: any) {
            toast.error(err.message || 'Error al cambiar estado');
        }
    };

    // Sedes
    const handleAddSede = async () => {
        if (!newSedeId || !newTipoRelacion) return toast.warning('Seleccione una sede y tipo de relación');
        setAddingSede(true);
        try {
            await fetchWithAuth('clientes/sedes', {
                method: 'POST',
                body: { id_cliente: clienteId, id_sede: newSedeId, tipo_relacion: newTipoRelacion },
            });
            toast.success('Sede agregada');
            setNewSedeId(0);
            setNewTipoRelacion('emisor');
            await loadClientData();
        } catch (err: any) {
            toast.error(err.message || 'Error');
        } finally {
            setAddingSede(false);
        }
    };

    const handleRemoveSede = async (sedeId: number, nombre: string) => {
        if (!confirm(`¿Desvincular sede "${nombre}"?`)) return;
        try {
            await fetchWithAuth(`clientes/${clienteId}/sedes/${sedeId}`, { method: 'DELETE' });
            toast.success('Sede desvinculada');
            loadClientData();
        } catch (err: any) {
            toast.error(err.message || 'Error');
        }
    };

    // Puestos
    useEffect(() => {
        setSelectedMercadoId(0);
        setSelectedPuestoId(0);
    }, [selectedSedeId]);

    const mercadosDisponibles = lugares.filter(l => l.tipo_lugar === 'mercado' && l.id_sede === selectedSedeId);
    const mercadosOptions = mercadosDisponibles.map(m => ({ value: m.id_lugar.toString(), label: m.nombre }));

    useEffect(() => {
        if (!selectedMercadoId) {
            setPuestosDelMercado([]);
            return;
        }
        const fetchPuestos = async () => {
            setCargandoPuestosMercado(true);
            try {
                const data = await fetchWithAuth<any[]>(`puestos/mercado/${selectedMercadoId}`);
                setPuestosDelMercado(data);
            } catch (err) {
                console.error(err);
                setPuestosDelMercado([]);
            } finally {
                setCargandoPuestosMercado(false);
            }
        };
        fetchPuestos();
    }, [selectedMercadoId]);

    const puestosOptions = puestosDelMercado.map(p => ({
        value: p.id_puesto.toString(),
        label: p.numero_puesto || 'Sin número',
    }));

    const handleAddPuesto = async () => {
        if (!selectedPuestoId || !selectedSeccion) return toast.warning('Complete todos los campos');
        setAddingPuesto(true);
        try {
            await fetchWithAuth(`clientes/${clienteId}/puestos`, {
                method: 'POST',
                body: { id_puesto: selectedPuestoId, seccion: selectedSeccion },
            });
            toast.success('Puesto asignado');
            setSelectedSedeId(0);
            setSelectedMercadoId(0);
            setSelectedPuestoId(0);
            setSelectedSeccion('');
            await loadClientData();
        } catch (err: any) {
            toast.error(err.message || 'Error');
        } finally {
            setAddingPuesto(false);
        }
    };

    const handleRemovePuesto = async (puestoId: number, numero: string) => {
        if (!confirm(`¿Desvincular puesto "${numero}"?`)) return;
        try {
            await fetchWithAuth(`clientes/${clienteId}/puestos/${puestoId}`, { method: 'DELETE' });
            toast.success('Puesto desvinculado');
            loadClientData();
        } catch (err: any) {
            toast.error(err.message || 'Error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !cliente) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-red-600 dark:text-red-400">{error || 'Cliente no encontrado'}</p>
                    <Button onClick={() => router.push('/dashboard/clientes')} className="mt-4">
                        Volver a la lista
                    </Button>
                </div>
            </div>
        );
    }

    const sedesDisponibles = sedes.filter(s => !sedesAsignadas.some(sa => sa.id_sede === s.id_sede));
    const sedesOptions = sedesDisponibles.map(s => ({ value: s.id_sede.toString(), label: s.nombre }));
    const sedesClienteOptions = sedesAsignadas.map(s => ({ value: s.id_sede.toString(), label: s.sedes?.nombre || '' }));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard/clientes')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a clientes
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {cliente.nombres} {cliente.apellidos}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge size="sm" color={cliente.estado ? 'success' : 'error'}>
                                    {cliente.estado ? 'Activo' : 'Inactivo'}
                                </Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    <Hash className="inline w-3 h-3 mr-1" />
                                    ID {cliente.id_cliente}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleToggleEstado} className="gap-2">
                                {cliente.estado ? <Power className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {cliente.estado ? 'Desactivar' : 'Activar'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex gap-6">
                        {[
                            { id: 'basico', label: 'Datos básicos', icon: User },
                            { id: 'sedes', label: 'Sedes', icon: Building2 },
                            { id: 'puestos', label: 'Puestos', icon: LayoutGrid },
                        ].map(tab => {
                            const Icon = tab.icon as LucideIcon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                    flex items-center gap-2 pb-2 px-1 text-sm font-medium transition-all
                    ${activeTab === tab.id
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6">
                        {activeTab === 'basico' && (
                            <div>
                                {editingBasic ? (
                                    <form onSubmit={handleSubmit(onSaveBasic)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label>Nombres *</Label>
                                                <Controller name="nombres" control={control} render={({ field }) => (
                                                    <Input {...field} error={!!errors.nombres} />
                                                )} />
                                                {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres.message}</p>}
                                            </div>
                                            <div>
                                                <Label>Apellidos *</Label>
                                                <Controller name="apellidos" control={control} render={({ field }) => (
                                                    <Input {...field} error={!!errors.apellidos} />
                                                )} />
                                                {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos.message}</p>}
                                            </div>
                                            <div>
                                                <Label>Apodo *</Label>
                                                <Controller name="apodo" control={control} render={({ field }) => (
                                                    <Input {...field} error={!!errors.apodo} />
                                                )} />
                                                {errors.apodo && <p className="text-red-500 text-xs mt-1">{errors.apodo.message}</p>}
                                            </div>
                                            <div>
                                                <Label>Teléfono *</Label>
                                                <Controller name="telefono" control={control} render={({ field }) => (
                                                    <Input {...field} error={!!errors.telefono} />
                                                )} />
                                                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label>Observaciones</Label>
                                                <Controller name="observaciones" control={control} render={({ field }) => (
                                                    <TextArea {...field} rows={3} />
                                                )} />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <Button type="button" variant="outline" onClick={() => setEditingBasic(false)} className="gap-2">
                                                <X className="w-4 h-4" /> Cancelar
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                                                <Save className="w-4 h-4" /> Guardar
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Nombres</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{cliente.nombres}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Apellidos</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{cliente.apellidos || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Apodo</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{cliente.apodo || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{cliente.telefono || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 flex items-start gap-3">
                                                <div className="w-5 h-5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Observaciones</p>
                                                    <p className="text-gray-900 dark:text-white">{cliente.observaciones || '—'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <Button onClick={() => setEditingBasic(true)} variant="outline" className="gap-2">
                                                <Edit3 className="w-4 h-4" /> Editar datos
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'sedes' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-500" />
                                        Sedes asignadas
                                    </h3>
                                    {sedesAsignadas.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                            <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 dark:text-gray-400">No hay sedes asignadas aún.</p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 border rounded-lg overflow-hidden">
                                            {sedesAsignadas.map(s => (
                                                <li key={s.id_cliente_sede} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{s.sedes?.nombre}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Relación: {s.tipo_relacion}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveSede(s.id_sede, s.sedes?.nombre || '')}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                        title="Desvincular"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Agregar nueva sede
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Select
                                            options={sedesOptions}
                                            placeholder="Seleccionar sede"
                                            value={newSedeId ? newSedeId.toString() : ''}
                                            onChange={(v) => setNewSedeId(Number(v))}
                                        />
                                        <Select options={tipoRelacionOptions} value={newTipoRelacion} onChange={setNewTipoRelacion} />
                                        <Button onClick={handleAddSede} disabled={addingSede || !newSedeId} className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            {addingSede ? 'Agregando...' : 'Agregar sede'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'puestos' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <LayoutGrid className="w-5 h-5 text-blue-500" />
                                        Puestos asignados
                                    </h3>
                                    {puestosAsignados.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                            <LayoutGrid className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 dark:text-gray-400">No hay puestos asignados aún.</p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 border rounded-lg overflow-hidden">
                                            {puestosAsignados.map(p => (
                                                <li key={p.id_cliente_puesto} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {p.puestos?.numero_puesto} - {p.puestos?.lugares_operativos?.nombre}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Sección: {p.seccion || '—'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemovePuesto(p.id_puesto, p.puestos?.numero_puesto || '')}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                        title="Desvincular"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {sedesAsignadas.length === 0 ? (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Primero asigne una sede al cliente para poder asignar puestos.
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h4 className="font-medium mb-4 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Asignar nuevo puesto
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <Select
                                                options={sedesClienteOptions}
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
                                            <Select
                                                options={seccionOptions}
                                                placeholder="Sección"
                                                value={selectedSeccion}
                                                onChange={setSelectedSeccion}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleAddPuesto}
                                            disabled={addingPuesto || !selectedPuestoId || !selectedSeccion}
                                            className="mt-4 w-full md:w-auto gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {addingPuesto ? 'Asignando...' : 'Asignar puesto'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}