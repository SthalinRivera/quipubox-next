'use client';

import { useState, useEffect } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useSedes } from '@/hooks/useSedes';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { TrashBinIcon } from '@/icons';
import { fetchWithAuth } from '@/lib/api-client';
import type { Cliente, ClienteSede } from '@/types/cliente';
import { TipoRelacionClienteSede, TIPOS_RELACION_CLIENTE_SEDE } from '@/types/enums';

interface ClienteSedesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: Cliente | null;
    onSaved?: () => void; // Para refrescar la tabla principal después de cambios
}

export function ClienteSedesModal({
    open,
    onOpenChange,
    cliente,
    onSaved,
}: ClienteSedesModalProps) {
    const { getSedes, associateSede } = useClientes();
    const { sedes, fetchAll: fetchSedes } = useSedes();
    const toast = useToast();

    const [sedesAsociadas, setSedesAsociadas] = useState<ClienteSede[]>([]);
    const [adding, setAdding] = useState(false);
    const [newSedeId, setNewSedeId] = useState<string>('');
    const [tipoRelacion, setTipoRelacion] = useState<TipoRelacionClienteSede | ''>('');

    // Cargar las sedes ya asociadas al cliente
    const loadSedes = async () => {
        if (cliente) {
            try {
                const data = await getSedes(cliente.id_cliente);
                setSedesAsociadas(data || []);
            } catch (err) {
                console.error('Error loading associated sedes:', err);
            }
        }
    };

    // Al abrir el modal, cargar listas
    useEffect(() => {
        if (open && cliente) {
            fetchSedes();
            loadSedes();
        }
    }, [open, cliente, fetchSedes]);

    // Agregar una nueva sede
    const handleAdd = async () => {
        if (!cliente || !newSedeId || !tipoRelacion) return;
        setAdding(true);
        try {
            await associateSede(cliente.id_cliente, Number(newSedeId), tipoRelacion);
            toast.success('✅ Sede agregada correctamente');
            await loadSedes();           // recargar lista actualizada
            setNewSedeId('');
            setTipoRelacion('');
            onSaved?.();                 // refrescar tabla principal
        } catch (error: any) {
            toast.error(error.message || 'Error al agregar sede');
        } finally {
            setAdding(false);
        }
    };

    // Eliminar una sede asociada
    const handleRemove = async (sedeId: number, nombreSede: string) => {
        if (!cliente) return;
        const confirmar = window.confirm(
            `¿Desvincular la sede "${nombreSede}" de este cliente?`
        );
        if (!confirmar) return;

        try {
            console.log(`Eliminando sede ${sedeId} del cliente ${cliente.id_cliente}`);
            const response = await fetchWithAuth(
                `clientes/${cliente.id_cliente}/sedes/${sedeId}`,
                {
                    method: 'DELETE',
                }
            );
            console.log('Respuesta DELETE:', response);
            toast.success(`🗑️ Sede "${nombreSede}" desvinculada`);

            // Recargar lista local
            await loadSedes();
            // Forzar refresco de la tabla principal (invalida cache)
            if (onSaved) onSaved();
        } catch (error: any) {
            console.error('Error al eliminar:', error);
            toast.error(error.message || 'Error al desvincular sede');
        }
    };
    // Opciones para el select de sedes disponibles
    const sedesDisponibles = sedes.filter(
        (s) => !sedesAsociadas.some((sa) => sa.id_sede === s.id_sede)
    );
    const selectOptions = sedesDisponibles.map((s) => ({
        value: s.id_sede.toString(),
        label: s.nombre,
    }));

    // Opciones para el tipo de relación
    const tipoRelacionOptions = TIPOS_RELACION_CLIENTE_SEDE.map((valor) => ({
        value: valor,
        label: valor.charAt(0).toUpperCase() + valor.slice(1), // Emisor, Receptor, Ambos
    }));

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[500px] p-5 lg:p-8">
            <div className="space-y-5">
                {/* Encabezado amigable */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        🏢 Sedes del cliente
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cliente?.nombres} — Aquí puedes ver y administrar las sedes donde opera.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Cada sede tiene un rol: <strong>emisor</strong> (envía mercadería),{' '}
                        <strong>receptor</strong> (recibe) o <strong>ambos</strong>.
                    </p>
                </div>

                {/* Lista de sedes ya asociadas */}
                <div>
                    <Label className="text-sm font-medium">📍 Sedes asignadas</Label>
                    <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50 dark:bg-gray-800/40">
                        {sedesAsociadas.length === 0 ? (
                            <li className="text-sm text-gray-500 italic text-center py-2">
                                Sin sedes asignadas. Agrega una más abajo.
                            </li>
                        ) : (
                            sedesAsociadas.map((sa) => (
                                <li key={sa.id_cliente_sede} className="flex justify-between items-center border-b pb-2 last:border-0 dark:border-gray-700">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">
                                            {sa.sedes?.nombre}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Rol: <span className="capitalize font-medium">{sa.tipo_relacion}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(sa.id_sede, sa.sedes?.nombre || '')}   // 👈 enviamos id_sede
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Desvincular esta sede"
                                    >
                                        <TrashBinIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Formulario para agregar nueva sede */}
                <div className="border-t pt-4 space-y-4 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">➕ Agregar nueva sede</p>
                    <div>
                        <Label htmlFor="sedeSelect">Seleccionar sede</Label>
                        <Select
                            options={selectOptions}
                            placeholder="— Elige una sede —"
                            defaultValue={newSedeId}
                            onChange={setNewSedeId}
                        />
                    </div>

                    <div>
                        <Label htmlFor="tipoRelacionSelect">Tipo de relación</Label>
                        <Select
                            options={tipoRelacionOptions}
                            placeholder="— Elige el rol —"
                            defaultValue={tipoRelacion}
                            onChange={(val) => setTipoRelacion(val as TipoRelacionClienteSede)}
                        />
                    </div>

                    <Button
                        onClick={handleAdd}
                        disabled={adding || !newSedeId || !tipoRelacion}
                        size="sm"
                        className="w-full"
                    >
                        {adding ? 'Agregando...' : '➕ Agregar sede'}
                    </Button>
                </div>

                {/* Nota final de ayuda */}
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                    Puedes eliminar una sede usando el ícono 🗑️. Los cambios se reflejan al instante.
                </p>
            </div>
        </Modal>
    );
}