'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { fetchWithAuth } from '@/lib/api-client';
import { saldoDestino, type DestinoFlujo } from '@/types/flujoOperacion';

export default function EntregaProcesoModal({
  item,
  fechaCarga,
  onClose,
  onSaved,
}: {
  item: DestinoFlujo;
  fechaCarga: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const saldo = saldoDestino(item);
  const [cantidad, setCantidad] = useState(saldo);
  const [rechazo, setRechazo] = useState(0);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [observaciones, setObservaciones] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const guardar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (
      !nombre.trim() ||
      !Number.isInteger(cantidad) ||
      !Number.isInteger(rechazo) ||
      cantidad < 0 ||
      rechazo < 0 ||
      cantidad + rechazo <= 0 ||
      cantidad + rechazo > saldo
    ) {
      setError(
        'Indica quién recibe y cantidades válidas que no excedan el saldo.',
      );
      return;
    }
    setBusy(true);
    setError('');
    try {
      await fetchWithAuth('entregas', {
        method: 'POST',
        body: {
          id_item_reparto: item.id_item_reparto,
          fecha_entrega: fecha,
          hora_entrega: format(new Date(), 'HH:mm'),
          cantidad_entregada: cantidad,
          cantidad_rechazada: rechazo,
          estado_entrega:
            cantidad === saldo
              ? 'entregado_total'
              : cantidad === 0
                ? 'rechazado'
                : 'entregado_parcial',
          nombre_recibe: nombre.trim(),
          observaciones: observaciones.trim() || null,
          firma_recibido: false,
        },
      });
      await onSaved();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo registrar la entrega.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      isOpen
      onClose={() => {
        if (!busy) onClose();
      }}
      className="max-w-lg"
    >
      <form onSubmit={guardar} className="space-y-5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Registrar entrega
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {item.clientes?.nombres} · Puesto {item.puestos?.numero_puesto}
          </p>
        </div>
        <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          Quedan <strong>{saldo} jabas</strong> por entregar. La guía se
          vinculará automáticamente.
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
          >
            {error}
          </p>
        )}
        <div>
          <Label htmlFor="entrega-fecha">Fecha de entrega *</Label>
          <Input
            id="entrega-fecha"
            type="date"
            value={fecha}
            min={fechaCarga.slice(0, 10)}
            required
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entrega-cantidad">Jabas recibidas *</Label>
            <Input
              id="entrega-cantidad"
              type="number"
              min="0"
              max={String(saldo)}
              step={1}
              required
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="entrega-rechazo">Jabas rechazadas</Label>
            <Input
              id="entrega-rechazo"
              type="number"
              min="0"
              max={String(saldo)}
              step={1}
              required
              value={rechazo}
              onChange={(e) => setRechazo(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="entrega-nombre">Nombre de quien recibe *</Label>
          <Input
            id="entrega-nombre"
            value={nombre}
            required
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="entrega-notas">Observaciones</Label>
          <Input
            id="entrega-notas"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500">
          Las jabas rechazadas quedan pendientes de resolver. El estado se
          calcula con las cantidades recibidas.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Volver
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Guardando entrega…' : 'Confirmar entrega'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
