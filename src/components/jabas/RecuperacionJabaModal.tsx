'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input/Input';
import Select from '@/components/form/Select';
import { useJabas } from '@/hooks/useJabas';
import { useToast } from '@/hooks/useToast';
import type { JabaPorCobrar } from '@/types/jaba';

type TipoRecuperacion = 'vale' | 'recojo_puesto' | 'recojo_almacen' | 'ajuste' | 'perdida';

interface RecuperacionJabaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jaba: JabaPorCobrar | null;
    onSaved: () => void;
}

export function RecuperacionJabaModal({
    open,
    onOpenChange,
    jaba,
    onSaved,
}: RecuperacionJabaModalProps) {
    const { registrarRecuperacion } = useJabas();
    const toast = useToast();

    const [cantidad, setCantidad] = useState<number>(0);
    const [tipoRecuperacion, setTipoRecuperacion] = useState<TipoRecuperacion>('vale');
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && jaba) {
            setCantidad(jaba.saldo_pendiente || 0);
            setTipoRecuperacion('vale');
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
            await registrarRecuperacion({
                id_jaba_cobrar: jaba.id_jaba_cobrar,
                cantidad,
                tipo_recuperacion: tipoRecuperacion,
                fecha_recuperacion: new Date().toISOString().split('T')[0],
                observaciones: observaciones || undefined,
                id_empresa: jaba.id_empresa, // ✅ propiedad agregada
            });
            toast.success('Recuperación registrada correctamente');
            onSaved();
            onOpenChange(false);
        } catch (error) {
            // ya manejado en el hook
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)}>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Registrar Recuperación de Jabas
                </h2>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receptor: <strong>{jaba?.clientes?.nombres || 'N/A'}</strong>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Saldo pendiente: <strong>{jaba?.saldo_pendiente || 0}</strong> jabas
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tipo de jaba: <strong>{jaba?.tipos_jaba?.nombre || 'N/A'}</strong>
                    </p>
                    {jaba?.seccion && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sección: <strong>{jaba.seccion}</strong>
                        </p>
                    )}
                </div>

                <Input
                    label="Cantidad a recuperar"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    min={1}
                    max={jaba?.saldo_pendiente || 0}
                    required
                />

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo de recuperación
                    </label>
                    <Select
                        value={tipoRecuperacion}
                        onChange={(value) => setTipoRecuperacion(value as TipoRecuperacion)}
                        options={[
                            { value: 'vale', label: 'Vale' },
                            { value: 'recojo_puesto', label: 'Recojo en puesto' },
                            { value: 'recojo_almacen', label: 'Recojo en almacén' },
                            { value: 'ajuste', label: 'Ajuste' },
                            { value: 'perdida', label: 'Pérdida' },
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
                        {loading ? 'Registrando...' : 'Registrar Recuperación'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}