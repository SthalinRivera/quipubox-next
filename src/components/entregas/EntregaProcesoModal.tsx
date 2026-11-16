'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { fetchWithAuth } from '@/lib/api-client';
import { useOpcionesFlujo } from '@/hooks/useOpcionesFlujo';
import { type DestinoFlujo } from '@/types/flujoOperacion';

export default function EntregaProcesoModal({
  item,
  operacionId,
  fechaCarga,
  onClose,
  onSaved,
}: {
  item: DestinoFlujo;
  operacionId: number;
  fechaCarga: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { data: opciones, loading, error: optionsError } = useOpcionesFlujo<{items: { id_item_reparto: number; id_guia: number; saldo_pendiente: number }[]}>('entrega', { operacion: operacionId, item: item.id_item_reparto });
  const guia = opciones?.items[0];
  const saldo = guia?.saldo_pendiente || 0;
  const [cantidad, setCantidad] = useState(saldo);
  const [rechazo, setRechazo] = useState(0);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [observaciones, setObservaciones] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (guia) setCantidad(guia.saldo_pendiente); }, [guia]);
  const guardar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || loading || optionsError) return;
    if (!guia) { setError('Emite una guía válida antes de entregar.'); return; }
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
          id_guia: guia.id_guia,
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
      ariaLabel="Registrar recepción"
      onClose={() => { if (!busy) onClose(); }}
      className="mx-3 max-w-md"
    >
      <form onSubmit={guardar} aria-busy={loading || busy} className="max-h-[85dvh] space-y-3 overflow-y-auto p-5">
        <header className="pr-12">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Registrar recepción</h2>
          <p className="mt-1 text-xs text-gray-500">
            {item.clientes?.nombres || 'Receptor'} · Puesto {item.puestos?.codigo_puesto || '—'}
          </p>
        </header>
        {loading ? (
          <div role="status" aria-label="Cargando datos de recepción">
            <span className="sr-only">Cargando guía y saldo pendiente…</span>
            <div aria-hidden="true" className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map(i => <div key={i} className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-11 w-full" /></div>)}
              </div>
              <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-11 w-full" /></div>
              <Skeleton className="h-5 w-44" />
            </div>
          </div>
        ) : (
          <>
            {guia && <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <span>Pendiente de recibir</span><strong>{saldo} jabas</strong>
            </div>}
            {(error || optionsError || !guia) && <p role="alert" className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error || optionsError || 'Este destino ya no tiene una entrega pendiente con guía vigente.'}
            </p>}
            <fieldset disabled={busy || !guia || !!optionsError} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="entrega-fecha">Fecha *</Label>
                  <Input id="entrega-fecha" type="date" value={fecha} min={fechaCarga.slice(0, 10)} required onChange={e => setFecha(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="entrega-cantidad">Jabas recibidas *</Label>
                  <Input id="entrega-cantidad" type="number" min="0" max={String(saldo)} step={1} required value={cantidad} onChange={e => setCantidad(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <Label htmlFor="entrega-nombre">Quién recibe *</Label>
                <Input id="entrega-nombre" value={nombre} required placeholder="Nombre de quien recibe" onChange={e => setNombre(e.target.value)} />
              </div>
              <details className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Rechazos y observaciones{rechazo > 0 ? ` · ${rechazo} jabas` : ''}</summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor="entrega-rechazo">Jabas rechazadas</Label>
                    <Input id="entrega-rechazo" type="number" min="0" max={String(saldo)} step={1} required value={rechazo} onChange={e => setRechazo(Number(e.target.value))} />
                    <p className="mt-1 text-xs text-gray-500">Las rechazadas quedan pendientes de resolver.</p>
                  </div>
                  <div>
                    <Label htmlFor="entrega-notas">Observaciones</Label>
                    <Input id="entrega-notas" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                  </div>
                </div>
              </details>
            </fieldset>
          </>
        )}
        <footer className="flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <Button size="sm" variant="outline" disabled={busy} onClick={onClose}>Cancelar</Button>
          <Button size="sm" type="submit" disabled={busy || loading || !guia || !!optionsError}>
            {busy ? 'Guardando…' : 'Guardar recepción'}
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
