'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Layers, Package, Pencil, Plus, Trash2, UserRound } from 'lucide-react';
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
          {editable && (
            <Button onClick={() => setNuevoProducto(true)}>
              <Plus size={16} /> Agregar producto
            </Button>
          )}
        </div>
        {!op.detalle_carga.length ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Agrega un producto para comenzar. Luego podrás completar sus calidades.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {op.detalle_carga.map((d) => (
              <article
                key={d.id_detalle_carga}
                className="flex min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                aria-label={`${d.frutas?.nombre || 'Producto'} · ${d.cantidad_jabas} jabas`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><Package size={20} aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-semibold text-gray-900 dark:text-white">{d.frutas?.nombre || 'Producto'}</h3>
                      {d.variedades?.nombre && <p className="break-words text-xs text-gray-500 dark:text-gray-400">{d.variedades.nombre}</p>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-gray-400">#{d.id_detalle_carga}</span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><UserRound size={14} className="shrink-0 text-gray-400" aria-hidden="true" /><span className="break-words">{d.clientes?.nombres || 'Sin emisor'}</span></p>
                <div className="my-3 flex items-end justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
                  <p className="text-gray-900 dark:text-white"><span className="text-2xl font-semibold tabular-nums tracking-tight">{d.cantidad_jabas}</span><span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">jabas</span></p>
                  <span className="pb-1 text-xs font-medium text-gray-600 dark:text-gray-300">{d.tipos_jaba?.nombre || '—'}</span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${d.es_reparto ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'}`}>{d.es_reparto ? 'Reparto' : 'Directa'}</span>
                  {editable && <div className="flex gap-1.5">
                    <button type="button" disabled={busy} onClick={() => setEditar(d)} title="Editar producto" aria-label={`Editar ${d.frutas?.nombre || 'producto'} #${d.id_detalle_carga}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"><Pencil size={17} aria-hidden="true" /></button>
                    <button type="button" disabled={busy} onClick={() => eliminar(d)} title="Eliminar producto" aria-label={`Eliminar ${d.frutas?.nombre || 'producto'} #${d.id_detalle_carga}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"><Trash2 size={17} aria-hidden="true" /></button>
                  </div>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    <section id="calidad" className={card}>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><Layers size={20} /> 2. Calidades</h2>
      <div className="mt-4 space-y-3">
        {op.detalle_carga.map(d => {
          const total = (d.detalle_carga_calidades || []).reduce((sum,c) => sum + c.cantidad, 0);
          const requiere = d.es_reparto || (d.detalle_carga_calidades?.length || 0) > 0;
          const listo = !requiere || total === d.cantidad_jabas;
          return <div key={d.id_detalle_carga} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
            <div><p className="font-medium text-gray-900 dark:text-white">{d.frutas?.nombre} · {d.cantidad_jabas} jabas</p><p className="mt-1 text-sm text-gray-500">{requiere ? total + ' de ' + d.cantidad_jabas + ' jabas clasificadas' : 'Entrega directa: no requiere clasificación'}</p></div>
            <div className="flex items-center gap-3">
              {requiere && <Button variant="outline" onClick={() => setCalidadId(d.id_detalle_carga)}>{listo || !editable ? 'Ver calidades' : 'Completar calidades'}</Button>}
              {listo && <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400"><CheckCircle size={16} /> Completo</span>}
            </div>
          </div>;
        })}
        {!op.detalle_carga.length && <p className="text-sm text-gray-500">Agrega productos para registrar sus calidades.</p>}
      </div>
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
        <p role="status" className="text-sm text-gray-600 dark:text-gray-300">{!completa ? 'Completa la carga y la clasificación de todas las jabas.' : editable ? 'Carga y calidades completas. Termina la preparación para pasar la operación a En tránsito.' : 'Preparación completa. Las entregas se gestionan desde Entregar.'}</p>
        {editable && <Button disabled={busy || !completa} onClick={terminarPreparacion}>{busy ? 'Guardando…' : 'Terminar carga y calidades'}</Button>}
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
          onSaved={() => {
            setEditar(null);
            setNuevoProducto(false);
            void load();
          }}
        />
      )}
  </div>;
}
