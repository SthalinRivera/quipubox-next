'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { fetchWithAuth } from '@/lib/api-client';
import { saldoDestino, type DestinoFlujo } from '@/types/flujoOperacion';
export default function ResolucionRepartoModal({ item, onClose, onSaved }: { item: DestinoFlujo; onClose: () => void; onSaved: () => Promise<void> }) {
  const [tipo, setTipo] = useState('devolucion');
  const [cantidad, setCantidad] = useState(saldoDestino(item));
  const [motivo, setMotivo] = useState('');
  const [clave] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const guardar = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await fetchWithAuth(`items-reparto/${item.id_item_reparto}/resoluciones`, { method: 'POST', body: { tipo, cantidad, motivo: motivo.trim(), clave_idempotencia: clave } }); await onSaved(); onClose(); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo registrar.'); } finally { setBusy(false); }
  };
  return <Modal isOpen onClose={() => { if (!busy) onClose(); }} className="max-w-lg"><form onSubmit={guardar} className="space-y-4 p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resolver saldo</h2>
    <p className="text-sm text-gray-500">{item.clientes?.nombres} · {saldoDestino(item)} jabas pendientes. Requiere un responsable.</p>
    <div><Label htmlFor="res-tipo">Resultado</Label><select id="res-tipo" value={tipo} onChange={e => setTipo(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent p-2 dark:border-gray-700"><option value="devolucion">Devolución</option><option value="merma">Merma o pérdida</option></select></div>
    <div><Label htmlFor="res-cantidad">Jabas</Label><Input id="res-cantidad" type="number" required min="1" max={String(saldoDestino(item))} step={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} /></div>
    <div><Label htmlFor="res-motivo">Motivo</Label><textarea id="res-motivo" required minLength={5} maxLength={1000} value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent p-2 dark:border-gray-700" /></div>
    <p className="text-xs text-gray-500">Este registro conserva el movimiento físico y no se puede editar.</p>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={onClose}>Volver</Button><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Confirmar resolución'}</Button></div>
  </form></Modal>;
}
