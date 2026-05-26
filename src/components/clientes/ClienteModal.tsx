'use client';

import { useState, useEffect } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
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
                nombres: editingCliente.nombres || '',
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
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[584px] p-5 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                    {editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    {editingCliente
                        ? 'Modifica los datos del cliente'
                        : 'Completa la información para crear un nuevo cliente'}
                </p>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="nombres">Nombres *</Label>
                        <Input
                            id="nombres"
                            value={form.nombres}
                            onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="apellidos">Apellidos</Label>
                        <Input
                            id="apellidos"
                            value={form.apellidos}
                            onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="apodo">Apodo</Label>
                        <Input
                            id="apodo"
                            value={form.apodo}
                            onChange={(e) => setForm({ ...form, apodo: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                            id="telefono"
                            value={form.telefono}
                            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <TextArea
                            value={form.observaciones}
                            onChange={(val) => setForm({ ...form, observaciones: val })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={submitting}>
                        {submitting ? 'Guardando...' : editingCliente ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}