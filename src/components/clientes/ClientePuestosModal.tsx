'use client';

import { useState, useEffect } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useSedes } from '@/hooks/useSedes';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import type { Cliente, ClienteSede } from '@/types/cliente';

interface ClienteSedesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: Cliente | null;
}

export function ClienteSedesModal({ open, onOpenChange, cliente }: ClienteSedesModalProps) {
    const { getSedes, associateSede } = useClientes();
    const { sedes, fetchAll: fetchSedes } = useSedes(); // ✅ usar fetchAll alias fetchSedes
    const toast = useToast();
    const [sedesAsociadas, setSedesAsociadas] = useState<ClienteSede[]>([]);
    const [adding, setAdding] = useState(false);
    const [newSedeId, setNewSedeId] = useState<string>('');
    const [tipoRelacion, setTipoRelacion] = useState('');

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

    useEffect(() => {
        if (open && cliente) {
            fetchSedes(); // ✅ ahora existe
            loadSedes();
        }
    }, [open, cliente, fetchSedes]);

    const handleAdd = async () => {
        if (!cliente || !newSedeId || !tipoRelacion) return;
        setAdding(true);
        try {
            await associateSede(cliente.id_cliente, Number(newSedeId), tipoRelacion);
            toast.success('Sede asociada');
            await loadSedes();
            setNewSedeId('');
            setTipoRelacion('');
        } catch (error: any) {
            toast.error(error.message || 'Error al asociar sede');
        } finally {
            setAdding(false);
        }
    };

    const sedesDisponibles = sedes.filter(s => !sedesAsociadas.some(sa => sa.id_sede === s.id_sede));

    const selectOptions = sedesDisponibles.map(s => ({
        value: s.id_sede.toString(),
        label: s.nombre,
    }));

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[450px] p-5 lg:p-8">
            <div className="space-y-4">
                <div>
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        Sedes del cliente
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cliente?.nombres}
                    </p>
                </div>

                <div className="space-y-4">
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {sedesAsociadas.map(sa => (
                            <li key={sa.id_cliente_sede} className="flex justify-between items-center border-b pb-2 dark:border-gray-800">
                                <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-white">{sa.sedes?.nombre}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Relación: {sa.tipo_relacion}</p>
                                </div>
                            </li>
                        ))}
                        {sedesAsociadas.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No hay sedes asociadas</p>
                        )}
                    </ul>

                    <div className="border-t pt-4 space-y-3 dark:border-gray-800">
                        <div>
                            <Label>Seleccionar Sede</Label>
                            <Select
                                options={selectOptions}
                                placeholder="Seleccionar sede"
                                defaultValue={newSedeId}
                                onChange={setNewSedeId}
                            />
                        </div>

                        <div>
                            <Label htmlFor="tipoRelacion">Tipo de relación</Label>
                            <Input
                                id="tipoRelacion"
                                placeholder="Ej. envío, facturación"
                                value={tipoRelacion}
                                onChange={(e) => setTipoRelacion(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={handleAdd}
                                disabled={adding || !newSedeId || !tipoRelacion}
                                size="sm"
                                className="w-full"
                            >
                                {adding ? 'Agregando...' : 'Agregar sede'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}