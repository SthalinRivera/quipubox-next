'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ArrowUpDown, ArrowLeft, CheckCircle, Layers, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import Button from '@/components/ui/button/Button';
import { Stepper } from '@/components/ui/Stepper';
import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { DetalleCargaModal } from '@/components/detalle-carga/DetalleCargaModal';
import { CalidadesProcesoModal } from '@/components/detalle-carga/CalidadesProcesoModal';
import { cargaEditable, clasificacionCompleta, estadoOperacion, type OperacionFlujo } from '@/types/flujoOperacion';
import type { DetalleCarga } from '@/types/detalleCarga';
const card = 'scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900';
export default function OperacionDetallePage() {
  const params = useParams();
  const id = Number(params.id);
  const [op, setOp] = useState<OperacionFlujo | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState(false);
  const [calidadId, setCalidadId] = useState<number | null>(null);
  const [orden, setOrden] = useState<number[] | null>(null);
  const [editar, setEditar] = useState<DetalleCarga | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('agregarProducto') !== '1' || !op) return;
    if (cargaEditable(op.estado)) setNuevoProducto(true);
    url.searchParams.delete('agregarProducto');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }, [op]);
  const load = useCallback(async () => {
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('La operación no es válida.');
      return;
    }
    try {
      const data = await fetchWithAuth<OperacionFlujo>(
        `operaciones-carga/${id}/reparto`,
      );
      setOp(data);
      setError('');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo cargar la operación.',
      );
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);

  const eliminar = async (detalle: DetalleCarga) => {
    if (
      !window.confirm(
        `¿Eliminar la carga de ${detalle.cantidad_jabas} jabas de ${detalle.frutas?.nombre || 'este producto'}?`,
      )
    )
      return;
    setBusy(true);
    try {
      await fetchWithAuth(`detalle-carga/${detalle.id_detalle_carga}`, {
        method: 'DELETE',
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setBusy(false);
    }
  };

  const mover = (index: number, cambio: number) => {
    setOrden(actual => {
      if (!actual || index + cambio < 0 || index + cambio >= actual.length) return actual;
      const siguiente = [...actual];
      [siguiente[index], siguiente[index + cambio]] = [siguiente[index + cambio], siguiente[index]];
      return siguiente;
    });
  };
  const guardarOrden = async () => {
    if (!orden || busy) return;
    setBusy(true); setError('');
    try {
      await fetchWithAuth('operaciones-carga/' + id + '/detalles/orden', { method: 'PUT', body: { ids: orden } });
      setOrden(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar el orden.'); }
    finally { setBusy(false); }
  };
  const terminarPreparacion = async () => {
    if (busy || !op || !cargaEditable(op.estado) || !clasificacionCompleta(op)) return;
    setBusy(true); setError('');
    try {
      await fetchWithAuth('operaciones-carga/' + id + '/finalizar', { method: 'POST' });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo terminar la preparación.'); }
    finally { setBusy(false); }
  };
  if (!op && !error) return <OperationSkeleton variant="overview" />;
  if (!op)
    return (
      <div className={card}>
        <p role="status" className="text-gray-600 dark:text-gray-300">
          {error || 'Cargando la operación…'}
        </p>
        {error && (
          <Button onClick={load} className="mt-4">
            Volver a intentar
          </Button>
        )}
      </div>
    );

  const editable = cargaEditable(op.estado);
  const completa = clasificacionCompleta(op);
  return <div className="mx-auto max-w-full space-y-4 pb-6">
    <Link href="/dashboard/operaciones-carga" className="inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft size={16} /> Todas las cargas</Link>
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Carga #{id}</h1><p className="mt-1 text-sm text-gray-500">Camión {op.camiones?.placa} · Carga y calidades</p></div>
      <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{estadoOperacion[op.estado] || op.estado}</span>
    </header>
    <Stepper operacion={op} />
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <section id="carga" className={card}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Package size={20} /> 1. Carga
            </h2>
          </div>
          {editable && <div className="flex flex-wrap gap-2">
            {orden ? <>
              <Button disabled={busy} variant="outline" onClick={() => setOrden(null)}>Cancelar</Button>
              <Button disabled={busy} onClick={guardarOrden}>Guardar orden</Button>
            </> : <>
              {<Button disabled={busy || op.detalle_carga.length < 2} variant="outline" onClick={() => setOrden(op.detalle_carga.map(d => d.id_detalle_carga))}><ArrowUpDown size={16} /> Reordenar</Button>}
              <Button disabled={busy} onClick={() => setNuevoProducto(true)}><Plus size={16} /> Agregar producto</Button>
            </>}
          </div>}
        </div>
        {!op.detalle_carga.length ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Agrega un producto para comenzar. Luego podrás completar sus calidades.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {(orden ? orden.map(detalleId => op.detalle_carga.find(d => d.id_detalle_carga === detalleId)!).filter(Boolean) : op.detalle_carga).map((d, index) => (
              <li key={d.id_detalle_carga} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 text-sm">
                <span className="w-6 shrink-0 text-gray-400">{index + 1}.</span>
                <div className="min-w-36 flex-1"><span className="font-medium text-gray-900 dark:text-white">{d.frutas?.nombre || 'Producto'}</span> <span className="text-xs text-gray-400">#{d.id_detalle_carga}</span>{d.variedades?.nombre && <span className="ml-2 text-gray-500">{d.variedades.nombre}</span>}</div>
                <span className="min-w-24 text-gray-600 dark:text-gray-300">{d.clientes?.nombres || 'Sin emisor'}</span>
                <span className="min-w-24 tabular-nums"><strong>{d.cantidad_jabas}</strong> jabas</span>
                <span className="min-w-24 text-gray-500">{d.tipos_jaba?.nombre || '—'}</span>
                <span className="min-w-16 text-gray-500">{d.es_reparto ? 'Reparto' : 'Directa'}</span>
                {editable && <div className="flex gap-2">
                  {orden ? <>
                    <button type="button" disabled={busy || index === 0} onClick={() => mover(index, -1)} aria-label={'Subir producto #' + d.id_detalle_carga} className="rounded-lg border p-2 disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button type="button" disabled={busy || index === orden.length - 1} onClick={() => mover(index, 1)} aria-label={'Bajar producto #' + d.id_detalle_carga} className="rounded-lg border p-2 disabled:opacity-30"><ArrowDown size={16} /></button>
                  </> : <>
                    <button type="button" disabled={busy} onClick={() => setEditar(d)} aria-label={'Editar producto #' + d.id_detalle_carga} className="rounded-lg p-2 text-blue-600"><Pencil size={16} /></button>
                    <button type="button" disabled={busy} onClick={() => eliminar(d)} aria-label={'Eliminar producto #' + d.id_detalle_carga} className="rounded-lg p-2 text-red-600"><Trash2 size={16} /></button>
                  </>}
                </div>}
              </li>
            ))}
          </ul>
        )}
      </section>

    <section id="calidad" className={card}>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><Layers size={20} /> 2. Calidades</h2>
      <div className="mt-4 space-y-3">
        {op.detalle_carga.map(d => {
          const total = (d.detalle_carga_calidades || []).reduce((sum,c) => sum + c.cantidad, 0);
          const listo = total === d.cantidad_jabas;
          return <div key={d.id_detalle_carga} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
            <div><p className="font-medium text-gray-900 dark:text-white">{d.frutas?.nombre} · {d.cantidad_jabas} jabas</p><p className="mt-1 text-sm text-gray-500">{total + ' de ' + d.cantidad_jabas + ' jabas clasificadas'}</p></div>
            <div className="flex items-center gap-3">
              {<Button variant="outline" onClick={() => setCalidadId(d.id_detalle_carga)}>{listo || !editable ? 'Ver calidades' : 'Completar calidades'}</Button>}
              {listo && <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400"><CheckCircle size={16} /> Completo</span>}
            </div>
          </div>;
        })}
        {!op.detalle_carga.length && <p className="text-sm text-gray-500">Agrega productos para registrar sus calidades.</p>}
      </div>
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
        <p role="status" className="text-sm text-gray-600 dark:text-gray-300">{!completa ? 'Completa la carga y la clasificación de todas las jabas.' : editable ? 'Carga y calidades completas. Termina la preparación para pasar la operación a En tránsito.' : 'Preparación completa. Las entregas se gestionan desde Entregar.'}</p>
        {editable && <Button disabled={busy || !!orden || !completa} onClick={terminarPreparacion}>{busy ? 'Guardando…' : 'Terminar carga y calidades'}</Button>}
      </div>
    </section>
      {calidadId !== null && op.detalle_carga.find((d) => d.id_detalle_carga === calidadId) && (
        <CalidadesProcesoModal
          key={calidadId}
          detalle={op.detalle_carga.find((d) => d.id_detalle_carga === calidadId)!}
          editable={editable}
          onClose={() => setCalidadId(null)}
          onSaved={load}
        />
      )}
      {(nuevoProducto || editar) && (
        <DetalleCargaModal
          isOpen
          operacionId={id}
          editingDetalle={editar}
          onClose={() => { setEditar(null); setNuevoProducto(false); }}
          onSaved={async (guardado) => {
            setEditar(null);
            setNuevoProducto(false);
            await load();
            if (guardado) setCalidadId(guardado.id_detalle_carga);
          }}
        />
      )}
  </div>;
}
