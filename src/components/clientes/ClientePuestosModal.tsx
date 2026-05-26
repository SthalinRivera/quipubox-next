'use client';

import { useState, useEffect } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useSedes } from '@/hooks/useSedes'; // necesitas crear este hook
import { useToast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Cliente, ClienteSede } from '@/types/cliente';

interface ClienteSedesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: Cliente | null;
}

export function ClienteSedesModal({ open, onOpenChange, cliente }: ClienteSedesModalProps) {
    const { getSedes, associateSede } = useClientes();
    const { sedes, fetchSedes } = useSedes();
    const toast = useToast();
    const [sedesAsociadas, setSedesAsociadas] = useState<ClienteSede[]>([]);
    const [adding, setAdding] = useState(false);
    const [newSedeId, setNewSedeId] = useState<string>('');
    const [tipoRelacion, setTipoRelacion] = useState('');

    const loadSedes = async () => {
        if (cliente) {
            const data = await getSedes(cliente.id_cliente);
            setSedesAsociadas(data);
        }
    };

    useEffect(() => {
        if (open && cliente) {
            fetchSedes();
            loadSedes();
        }
    }, [open, cliente]);

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
            toast.error(error.message);
        } finally {
            setAdding(false);
        }
    };

    const sedesDisponibles = sedes.filter(s => !sedesAsociadas.some(sa => sa.id_sede === s.id_sede));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Sedes del cliente</DialogTitle>
                    <DialogDescription>{cliente?.nombres}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <ul className="space-y-2">
                        {sedesAsociadas.map(sa => (
                            <li key={sa.id_cliente_sede} className="flex justify-between items-center border-b pb-1">
                                <div>
                                    <p className="font-medium">{sa.sedes?.nombre}</p>
                                    <p className="text-xs text-muted-foreground">Relación: {sa.tipo_relacion}</p>
                                </div>
                                {/* Botón de eliminar: puedes implementar después */}
                            </li>
                        ))}
                        {sedesAsociadas.length === 0 && <p className="text-muted-foreground">No hay sedes asociadas</p>}
                    </ul>
                    <div className="border-t pt-4 space-y-3">
                        <Select value={newSedeId} onValueChange={setNewSedeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar sede" />
                            </SelectTrigger>
                            <SelectContent>
                                {sedesDisponibles.map(s => (
                                    <SelectItem key={s.id_sede} value={s.id_sede.toString()}>
                                        {s.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Tipo de relación (ej. envío)"
                            value={tipoRelacion}
                            onChange={(e) => setTipoRelacion(e.target.value)}
                        />
                        <Button onClick={handleAdd} disabled={adding || !newSedeId || !tipoRelacion}>
                            {adding ? 'Agregando...' : 'Agregar sede'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}