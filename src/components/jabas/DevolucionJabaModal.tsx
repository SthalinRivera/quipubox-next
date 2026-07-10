// components/jabas/DevolucionJabaModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Select from '@/components/form/Select';
import { useJabas } from '@/hooks/useJabas';
import { useToast } from '@/hooks/useToast';
import type { JabaPorPagar } from '@/types/jaba';

// ✅ Definimos el tipo exacto que espera el backend (coincide con las opciones del Select)
type TipoDevolucion = 'jabas_fisicas' | 'vale_canjeado' | 'ajuste' | 'perdida_asumida';

interface DevolucionJabaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jaba: JabaPorPagar | null;
    onSaved: () => void;
}

export function DevolucionJabaModal({
    open,
    onOpenChange,
    jaba,
    onSaved,
}: DevolucionJabaModalProps) {
    const { registrarDevolucion } = useJabas();
    const toast = useToast();

    const [cantidad, setCantidad] = useState<number>(0);
    // ✅ Usamos el tipo exacto
    const [tipoDevolucion, setTipoDevolucion] = useState<TipoDevolucion>('jabas_fisicas');
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);

    // Resetear formulario al abrir
    useEffect(() => {
        if (open && jaba) {
            setCantidad(jaba.saldo_pendiente || 0);
            setTipoDevolucion('jabas_fisicas');
            setObservaciones('');
        }
    }, [open, jaba]);

    const handleSubmit = async () => {
        if (!jaba) return;
        if (cantidad <= 0 || cantidad > jaba.saldo_pendiente) {
            toast.error(`La cantidad debe estar entre 1 y ${jaba.saldo_pendiente}`);
            return;
        }
        setLoading(true);
        try {
            await registrarDevolucion({
                id_jaba_pagar: jaba.id_jaba_pagar,
                cantidad,
                tipo_devolucion: tipoDevolucion,
                fecha_devolucion: new Date().toISOString(),
                observaciones: observaciones || undefined,
            });
            toast.success('Devolución registrada correctamente');
            onSaved();
            onOpenChange(false);
        } catch (error) {
            // el error ya se muestra en el hook
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-[584px] p-5 lg:p-10">
            <div className="space-y-4">
                {/* Título del modal */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Registrar Devolución al Emisor
                </h2>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cliente: <strong>{jaba?.clientes?.nombres || 'N/A'}</strong>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Saldo pendiente: <strong>{jaba?.saldo_pendiente || 0}</strong> jabas
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tipo de jaba: <strong>{jaba?.tipos_jaba?.nombre || 'N/A'}</strong>
                    </p>
                </div>

                <Input
                    label="Cantidad a devolver"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    min={1}
                    max={jaba?.saldo_pendiente || 0}
                    required
                />

                {/* Select sin prop 'label', usamos un label HTML */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo de devolución
                    </label>
                    <Select
                        value={tipoDevolucion}
                        onChange={(value) => setTipoDevolucion(value as TipoDevolucion)}
                        options={[
                            { value: 'jabas_fisicas', label: 'Jabas físicas' },
                            { value: 'vale_canjeado', label: 'Vale canjeado' },
                            { value: 'ajuste', label: 'Ajuste' },
                            { value: 'perdida_asumida', label: 'Pérdida asumida' },
                        ]}
                    />
                </div>

                <Input
                    label="Observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Opcional"
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Devolución'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}