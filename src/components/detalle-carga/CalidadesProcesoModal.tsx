"use client";

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { fetchWithAuth } from '@/lib/api-client';
import type { DetalleCarga, DetalleCalidad } from '@/types/detalleCarga';

interface Props {
  detalle: DetalleCarga;
  editable: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}
const field = 'mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white';

export function CalidadesProcesoModal({ detalle, editable, onClose, onSaved }: Props) {
  const [rows, setRows] = useState(detalle.detalle_carga_calidades || []);
  const [options, setOptions] = useState<{ id_calidad: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(editable);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [removing, setRemoving] = useState<number | null>(null);
  const [form, setForm] = useState({ id: '', cantidad: '', precio: '' });
  const [editing, setEditing] = useState<DetalleCalidad | null>(null);
  useEffect(() => {
    if (!editable) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchWithAuth<typeof options>('calidades', { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setOptions(data); })
      .catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No se pudieron cargar las calidades.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [editable, retry]);
  const total = rows.reduce((sum, row) => sum + row.cantidad, 0);
  const available = detalle.cantidad_jabas - total + (editing?.cantidad || 0);
  const reset = () => { setEditing(null); setForm({ id: '', cantidad: '', precio: '' }); };
  const refresh = async () => {
    const data = await fetchWithAuth<DetalleCalidad[]>(`detalle-carga/${detalle.id_detalle_carga}/calidades`);
    setRows(data);
    await onSaved();
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !editable) return;
    const cantidad = Number(form.cantidad);
    const precio = form.precio === '' ? null : Number(form.precio);
    if (!Number(form.id) || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > available || (precio !== null && (!Number.isFinite(precio) || precio < 0))) {
      setError(`Selecciona una calidad y una cantidad entera entre 1 y ${available}. El precio no puede ser negativo.`);
      return;
    }
    setBusy(true); setError('');
    try {
      await fetchWithAuth(editing ? `detalle-carga/calidades/${editing.id_detalle_carga_calidad}` : `detalle-carga/${detalle.id_detalle_carga}/calidades`, {
        method: editing ? 'PUT' : 'POST', body: { id_calidad: Number(form.id), cantidad, precio_unitario: precio },
      });
      reset();
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); }
    finally { setBusy(false); }
  };
  const remove = async (id: number) => {
    if (busy || !editable) return;
    setBusy(true); setError('');
    try {
      await fetchWithAuth(`detalle-carga/calidades/${id}`, { method: 'DELETE' });
      setRemoving(null);
      if (editing?.id_detalle_carga_calidad === id) reset();
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar.'); }
    finally { setBusy(false); }
  };
  return <Modal isOpen onClose={() => { if (!busy) onClose(); }} ariaLabel="Calidades del producto" className="mx-4 max-h-[90dvh] max-w-2xl overflow-y-auto">
    <div className="space-y-4 p-5 text-gray-900 sm:p-6 dark:text-white">
      <header className="pr-12"><h2 className="text-lg font-semibold">Calidades del producto</h2><p className="mt-1 text-sm text-gray-500">{detalle.frutas?.nombre} · {detalle.cantidad_jabas} jabas</p></header>
      <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"><div className="flex justify-between gap-3 text-sm"><span>{total} de {detalle.cantidad_jabas} jabas clasificadas</span><strong>{Math.max(0, detalle.cantidad_jabas - total)} pendientes</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full bg-brand-500" style={{ width: `${Math.min(100, detalle.cantidad_jabas ? total / detalle.cantidad_jabas * 100 : 0)}%` }} /></div></div>
      {!editable && <p className="text-sm text-gray-500">Consulta las calidades registradas. Esta carga ya no permite cambios.</p>}
      {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}{!options.length && editable && <button type="button" className="ml-2 underline" onClick={() => setRetry((n) => n + 1)}>Reintentar</button>}</div>}
      {loading ? <OperationSkeleton variant="compact" heading={false} /> : editable && options.length > 0 && available > 0 && <form onSubmit={save} className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/40">
        <h3 className="text-sm font-semibold">{editing ? 'Editar calidad' : 'Agregar calidad'}</h3>
        <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-medium">Calidad<select required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className={field}><option value="">Seleccionar</option>{options.filter((o) => !rows.some((row) => row.id_calidad === o.id_calidad && row.id_detalle_carga_calidad !== editing?.id_detalle_carga_calidad)).map((o) => <option key={o.id_calidad} value={o.id_calidad}>{o.nombre}</option>)}</select></label>
          <label className="text-xs font-medium">Cantidad de jabas<input required type="number" min={1} max={available} step={1} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} className={field} /></label>
          <label className="text-xs font-medium">Precio unitario (opcional)<input type="number" min={0} step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className={field} /></label>
        </fieldset>
        <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar calidad'}</Button>{editing && <Button variant="outline" disabled={busy} onClick={reset}>Cancelar edición</Button>}</div>
      </form>}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {!rows.length && <p className="py-4 text-sm text-gray-500">Aún no hay calidades registradas.</p>}
        {rows.map((row) => <div key={row.id_detalle_carga_calidad} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{row.calidades?.nombre || options.find((o) => o.id_calidad === row.id_calidad)?.nombre || `Calidad ${row.id_calidad}`}</p><p className="text-sm text-gray-500">{row.cantidad} jabas · {row.precio_unitario == null ? 'Sin precio' : `S/ ${Number(row.precio_unitario).toFixed(2)}`}</p></div>{editable && <div className="flex flex-wrap items-center gap-2">{removing === row.id_detalle_carga_calidad ? <><span className="text-xs">¿Eliminar calidad?</span><Button disabled={busy} variant="outline" onClick={() => void remove(row.id_detalle_carga_calidad)}>Sí, eliminar</Button><Button disabled={busy} variant="outline" onClick={() => setRemoving(null)}>Cancelar</Button></> : <><Button disabled={busy} variant="outline" onClick={() => { setRemoving(null); setEditing(row); setForm({ id: String(row.id_calidad), cantidad: String(row.cantidad), precio: row.precio_unitario == null ? '' : String(row.precio_unitario) }); }}>Editar</Button><Button disabled={busy} variant="outline" onClick={() => setRemoving(row.id_detalle_carga_calidad)}>Eliminar</Button></>}</div>}</div>)}
      </div>
      <footer className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><p role="status" className="text-xs text-gray-500">{busy ? 'Guardando cambios…' : 'Cada cambio se guarda al confirmar su acción.'}</p><Button disabled={busy} onClick={onClose}>Volver a la carga</Button></footer>
    </div>
  </Modal>;
}
