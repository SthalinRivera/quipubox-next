'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, X } from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { useSedes } from '@/hooks/useSedes';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import type { Cliente, ClienteSede } from '@/types/cliente';
import { TipoRelacionClienteSede, TIPOS_RELACION_CLIENTE_SEDE } from '@/types/enums';

interface ClienteSedesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: Cliente | null;
    onSaved?: () => void;
}

export function ClienteSedesModal({
    open,
    onOpenChange,
    cliente,
    onSaved,
}: ClienteSedesModalProps) {
    // ✅ Usar los nombres correctos del hook
    const { fetchSedesByCliente, assignSede, removeSede } = useClientes();
    const { sedes, fetchAll: fetchSedes } = useSedes();
    const toast = useToast();

    const [sedesAsociadas, setSedesAsociadas] = useState<ClienteSede[]>([]);
    const [adding, setAdding] = useState(false);
    const [newSedeId, setNewSedeId] = useState<string>('');
    const [tipoRelacion, setTipoRelacion] = useState<TipoRelacionClienteSede | ''>('');

    const loadSedes = async () => {
        if (cliente) {
            try {
                const data = await fetchSedesByCliente(cliente.id_cliente);
                setSedesAsociadas(data || []);
            } catch (err) {
                console.error('Error loading associated sedes:', err);
            }
        }
    };

    useEffect(() => {
        if (open && cliente) {
            fetchSedes();
            loadSedes();
        }
    }, [open, cliente, fetchSedes]);

    const handleAdd = async () => {
        if (!cliente || !newSedeId || !tipoRelacion) return;
        setAdding(true);
        try {
            // ✅ Usar assignSede (no associateSede)
            await assignSede(cliente.id_cliente, Number(newSedeId), tipoRelacion);
            toast.success('Sede agregada correctamente');
            await loadSedes();
            setNewSedeId('');
            setTipoRelacion('');
            onSaved?.();
        } catch (error: any) {
            toast.error(error.message || 'Error al agregar sede');
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (sedeId: number, nombreSede: string) => {
        if (!cliente) return;
        if (!confirm(`¿Desvincular la sede "${nombreSede}" de este cliente?`)) return;
        try {
            // ✅ Usar removeSede (ya existente)
            await removeSede(cliente.id_cliente, sedeId);
            toast.success(`Sede "${nombreSede}" desvinculada`);
            await loadSedes();
            onSaved?.();
        } catch (error: any) {
            toast.error(error.message || 'Error al desvincular sede');
        }
    };

    const sedesDisponibles = sedes.filter(
        (s) => !sedesAsociadas.some((sa) => sa.id_sede === s.id_sede)
    );
    const selectOptions = sedesDisponibles.map((s) => ({
        value: s.id_sede.toString(),
        label: s.nombre,
    }));

    const tipoRelacionOptions = TIPOS_RELACION_CLIENTE_SEDE.map((valor) => ({
        value: valor,
        label: valor.charAt(0).toUpperCase() + valor.slice(1),
    }));

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-lg p-0 overflow-hidden">
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Sedes del cliente
                        </h3>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    {/* Lista de sedes asignadas */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            📍 Sedes asignadas
                        </Label>
                        <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700">
                            {sedesAsociadas.length === 0 ? (
                                <li className="text-sm text-gray-500 italic text-center py-3">
                                    Sin sedes asignadas.
                                </li>
                            ) : (
                                sedesAsociadas.map((sa) => (
                                    <li
                                        key={sa.id_cliente_sede}
                                        className="flex justify-between items-center p-2 rounded-md bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">
                                                {sa.sedes?.nombre}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Rol: <span className="capitalize font-medium">{sa.tipo_relacion}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(sa.id_sede, sa.sedes?.nombre || '')}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                            title="Desvincular"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Formulario para agregar nueva sede */}
                    <div className="border-t pt-4 space-y-4 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Agregar nueva sede
                        </h4>
                        <div>
                            <Label htmlFor="sedeSelect">Seleccionar sede</Label>
                            <Select
                                options={selectOptions}
                                placeholder="— Elige una sede —"
                                value={newSedeId}
                                onChange={setNewSedeId}
                            />
                        </div>
                        <div>
                            <Label htmlFor="tipoRelacionSelect">Tipo de relación</Label>
                            <Select
                                options={tipoRelacionOptions}
                                placeholder="— Elige el rol —"
                                value={tipoRelacion}
                                onChange={(val) => setTipoRelacion(val as TipoRelacionClienteSede)}
                            />
                        </div>
                        <Button
                            onClick={handleAdd}
                            disabled={adding || !newSedeId || !tipoRelacion}
                            className="w-full gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {adding ? 'Agregando...' : 'Agregar sede'}
                        </Button>
                    </div>

                    {/* Ayuda */}
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                        Puedes eliminar una sede usando el ícono 🗑️.
                    </p>
                </div>
            </div>
        </Modal>
    );
}