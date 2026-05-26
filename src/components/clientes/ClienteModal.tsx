'use client';

import { useState, useEffect } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/useToast'; // Implementa un toast simple o usa sonner
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Cliente } from '@/types/cliente';

interface ClienteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCliente?: Cliente | null;
    onSaved: () => void;
}

export function ClienteModal({ open, onOpenChange, editingCliente, onSaved }: ClienteModalProps) {
    const { create, update } = useClientes();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        nombres: '',
        apellidos: '',
        apodo: '',
        telefono: '',
        observaciones: '',
    });

    useEffect(() => {
        if (editingCliente) {
            setForm({
                nombres: editingCliente.nombres,
                apellidos: editingCliente.apellidos || '',
                apodo: editingCliente.apodo || '',
                telefono: editingCliente.telefono || '',
                observaciones: editingCliente.observaciones || '',
            });
        } else {
            setForm({
                nombres: '',
                apellidos: '',
                apodo: '',
                telefono: '',
                observaciones: '',
            });
        }
    }, [editingCliente, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                id_empresa: 1, // reemplazar con la empresa del usuario
                estado: true,
            };
            if (editingCliente) {
                await update(editingCliente.id_cliente, payload);
                toast.success('Cliente actualizado');
            } else {
                await create(payload);
                toast.success('Cliente creado');
            }
            onSaved();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCliente ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
                    <DialogDescription>
                        {editingCliente
                            ? 'Modifica los datos del cliente'
                            : 'Completa la información para crear un nuevo cliente'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombres">Nombres *</Label>
                        <Input
                            id="nombres"
                            value={form.nombres}
                            onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apellidos">Apellidos</Label>
                        <Input
                            id="apellidos"
                            value={form.apellidos}
                            onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apodo">Apodo</Label>
                        <Input
                            id="apodo"
                            value={form.apodo}
                            onChange={(e) => setForm({ ...form, apodo: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                            id="telefono"
                            value={form.telefono}
                            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            value={form.observaciones}
                            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Guardando...' : editingCliente ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}