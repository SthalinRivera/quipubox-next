'use client';

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowLeft,
  Truck,
  FileText,
  MapPin,
  Trash2,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import ItemRepartoSimpleForm from '@/components/items-reparto/ItemRepartoSimpleForm';
import ResolucionRepartoModal from '@/components/entregas/ResolucionRepartoModal';
import EntregaProcesoModal from '@/components/entregas/EntregaProcesoModal';

import { DetalleCargaModal } from '@/components/detalle-carga/DetalleCargaModal';
import {
  cargaEditable,
  clasificacionCompleta,
  estadoOperacion,
  operacionAbierta,
  guiaVigente,
  saldoDestino,
  type OperacionFlujo,
  type DestinoFlujo,
} from '@/types/flujoOperacion';
import type { DetalleCarga } from '@/types/detalleCarga';

const card =
  'scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900';
const link =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:border-gray-700 dark:text-brand-300 dark:hover:bg-brand-500/10';

export default function OperacionDetallePage() {
  const params = useParams();
  const id = Number(params.id);
  const [op, setOp] = useState<OperacionFlujo | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [confirmarFinalizacion, setConfirmarFinalizacion] = useState(false);
  const [asignar, setAsignar] = useState<number | null>(null);
  const [resolver, setResolver] = useState<DestinoFlujo | null>(null);
  const [entregar, setEntregar] = useState<DestinoFlujo | null>(null);
  const [editar, setEditar] = useState<DetalleCarga | null>(null);
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
  const confirmarCarga = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetchWithAuth(`operaciones-carga/${id}/finalizar`, {
        method: 'POST',
      });
      setConfirmar(false);
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo confirmar la carga.',
      );
    } finally {
      setBusy(false);
    }
  };
  const ejecutar = async (ruta: string, method: 'POST' | 'PATCH' | 'DELETE', body?: { estado: string }) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await fetchWithAuth(ruta, { method, ...(body ? { body } : {}) }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar la acción.'); }
    finally { setBusy(false); }
  };
  const avanzar = (estado: string) => ejecutar(`operaciones-carga/${id}/estado`, 'PATCH', { estado });
  const emitirGuias = () => ejecutar(`operaciones-carga/${id}/generar-guias`, 'POST');
  const cerrar = () => { setError(''); setConfirmarFinalizacion(true); };
  const quitarDestino = async (itemId: number) => {
    if (
      !window.confirm(
        '¿Quitar este destino? Podrás asignar nuevamente las jabas antes de confirmar la carga.',
      )
    )
      return;
    setBusy(true);
    try {
      await fetchWithAuth(`items-reparto/${itemId}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo quitar el destino.',
      );
    } finally {
      setBusy(false);
    }
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
  const editable = operacionAbierta(op.estado);
  const preparando = cargaEditable(op.estado);
  const destinos = op.detalle_carga.flatMap((d) =>
    d.items_reparto.map((item) => ({
      ...item,
      esReparto: d.es_reparto,
      producto: d.frutas?.nombre || 'Producto',
      calidadesAsignadas: (item.items_reparto_detalle || []).map((asignacion) => ({
        nombre:
          d.detalle_carga_calidades?.find(
            (calidad) =>
              calidad.id_detalle_carga_calidad ===
              asignacion.id_detalle_carga_calidad,
          )?.calidades?.nombre || 'Calidad sin nombre',
        cantidad: asignacion.cantidad,
      })),
    })),
  );
  const entregas = destinos.flatMap((item) =>
    item.entregas.map((e) => ({
      ...e,
      cliente: item.clientes?.nombres,
      producto: item.producto,
    })),
  );
  const faltanGuias = destinos.some(item => saldoDestino(item) > 0 && !guiaVigente(item));
  const totalJabas = op.resumen.jabasCargadas;
  const recibidas = entregas.filter(e => e.estado_entrega !== 'pendiente').reduce((sum,e) => sum + e.cantidad_entregada, 0);
  const habilitada = op.estado !== 'pendiente' && clasificacionCompleta(op);
  return (
    <div className="mx-auto max-w-full space-y-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/items-reparto"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:hover:text-brand-300"
        >
          <ArrowLeft size={16} /> Volver al listado de operaciones
        </Link>
      </div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
            Operaciones
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Entregas · Carga #{id}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Camión {op.camiones?.placa} ·{' '}
            {op.fecha_carga.slice(0, 10).split('-').reverse().join('/')}
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          {estadoOperacion[op.estado] || op.estado}
        </span>
      </header>
      <dl className="grid grid-cols-2 divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white sm:grid-cols-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        {[['Productos', op.detalle_carga.length], ['Jabas', totalJabas], ['Destinos', destinos.length], ['Recibidas', recibidas]].map(([label, value]) => (
          <div key={label} className="border-r border-b border-gray-100 px-4 py-3 last:border-r-0 sm:border-b-0 dark:border-gray-800">
            <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-gray-900 dark:text-white">{value}</dd>
          </div>
        ))}
      </dl>
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </div>
      )}
      {(op.estado === 'completado') && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle size={20} />
          <strong>Entregas completadas</strong>
        </div>
      )}
      {!habilitada && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-900/10 dark:text-amber-200">
          <span>Completa la carga y la clasificación antes de gestionar las entregas.</span>
          <Link className={link} href={`/dashboard/operaciones-carga/${id}`}>Abrir carga</Link>
        </div>
      )}
      {habilitada && <>
      <section id="destinos" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Truck size={20} /> Entregas de la carga
          </h2>
          {['en_transito', 'repartiendo'].includes(op.estado) && faltanGuias && (
            <Button disabled={busy || !op.resumen.preparada} onClick={emitirGuias}>
              Emitir guías pendientes
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-3">
          {op.detalle_carga.map((d) => {
            const clasificado =
              d.detalle_carga_calidades?.reduce(
                (sum, c) => sum + c.cantidad,
                0,
              ) || 0;
            const asignado = d.items_reparto.reduce(
              (sum, i) => sum + i.cantidad_asignada,
              0,
            );
            const listo = !d.es_reparto || clasificado === d.cantidad_jabas;
            const destinosDelProducto = destinos.filter(
              (item) => item.id_detalle_carga === d.id_detalle_carga,
            );
            return (
              <div
                key={d.id_detalle_carga}
                className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {d.frutas?.nombre} · {d.cantidad_jabas} jabas
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {d.es_reparto
                        ? `Clasificadas: ${clasificado} de ${d.cantidad_jabas} jabas`
                        : 'No requiere clasificación por calidad'}{' '}
                      · Asignadas a receptores: {asignado} de {d.cantidad_jabas}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editable && d.es_reparto && asignado < d.cantidad_jabas && (
                      <Button
                        size="sm"
                        disabled={!listo}
                        onClick={() => setAsignar(d.id_detalle_carga)}
                      >
                        Asignar receptor
                      </Button>
                    )}
                    {editable && !d.es_reparto && asignado !== d.cantidad_jabas && <Button onClick={() => setEditar(d)}>Completar receptor</Button>}
                    {editable && !listo && <span className="w-full text-xs text-amber-700 dark:text-amber-400">Completa la clasificación antes de asignar receptores.</span>}
                    {listo && asignado === d.cantidad_jabas && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle size={16} /> Completo
                      </span>
                    )}
                  </div>
                </div>
                {destinosDelProducto.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                    {destinosDelProducto.map((item) => {
                      const recibidasItem = item.entregas
                        .filter((entrega) => entrega.estado_entrega !== 'pendiente')
                        .reduce((sum, entrega) => sum + entrega.cantidad_entregada, 0);
                      const resueltasItem = (item.resoluciones_reparto || [])
                        .reduce((sum, resolucion) => sum + resolucion.cantidad, 0);
                      const pendienteItem = saldoDestino(item);
                      const entregasActivas = item.entregas.filter((entrega) => entrega.estado_entrega !== 'pendiente');
                      return (
                      <div key={item.id_item_reparto} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            <MapPin size={15} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {item.clientes?.nombres || 'Receptor sin asignar'} · Puesto {item.puestos?.codigo_puesto || 'sin asignar'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.cantidad_asignada} jabas asignadas
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1.5 pl-10">
                          {item.guias_operativas.map((g) => {
                            const calidadesGuia = g.cobertura?.calidades?.length
                              ? g.cobertura.calidades
                              : item.calidadesAsignadas;
                            return (
                              <div key={g.id_guia} className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md bg-gray-50 px-2.5 py-2 dark:bg-gray-800/70">
                                <Link className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300" href={`/dashboard/guias-operativas/${g.id_guia}`}>
                                  <FileText size={15} aria-hidden="true" />
                                  Guía {g.numero_guia}
                                </Link>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium capitalize text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                                  {g.estado}
                                </span>
                                {calidadesGuia.length > 0 ? (
                                  <ul className="flex flex-wrap gap-1">
                                    {calidadesGuia.map((calidad, index) => (
                                      <li key={`${calidad.nombre}-${index}`} className="rounded-md bg-white px-2 py-1 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                        {calidad.nombre} · {calidad.cantidad} jabas
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Sin desglose por calidad</span>
                                )}
                                {!g.cobertura && <span className="text-xs text-amber-700 dark:text-amber-400">Histórica{saldoDestino(item) === 0 ? ' · destino completo' : ' · sin cobertura vigente'}</span>}
                                {['en_transito','repartiendo'].includes(op.estado) && !['anulada','reemplazada'].includes(g.estado) && <button type="button" disabled={busy} title="Anular guía" aria-label={`Anular guía ${g.numero_guia}`} className="ml-auto rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50" onClick={() => { if (window.confirm('¿Anular esta guía? Solo es posible si aún no tiene entregas.')) void ejecutar(`guias-operativas/${g.id_guia}`, 'DELETE'); }}><Trash2 size={15}/></button>}
                              </div>
                            );
                          })}
                          {item.guias_operativas.length === 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {['en_transito', 'repartiendo'].includes(op.estado)
                                ? 'Guía pendiente de emisión.'
                                : 'La guía se emitirá al confirmar la salida.'}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Recibidas: {recibidasItem}
                            {resueltasItem > 0 && ` · Resueltas: ${resueltasItem}`}
                            {` · Pendientes: ${pendienteItem}`}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {editable && item.esReparto && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => quitarDestino(item.id_item_reparto)}
                              >
                                Quitar destino
                              </Button>
                            )}
                            {['en_transito', 'repartiendo'].includes(op.estado) && pendienteItem > 0 && (
                              <>
                                {op.estado === 'repartiendo' && <Button size="sm" variant="outline" disabled={busy} onClick={() => setResolver(item)}>
                                  Resolver faltante
                                </Button>}
                                <Button
                                  size="sm"
                                  disabled={!guiaVigente(item) || busy || (op.estado === 'en_transito' && (faltanGuias || !op.resumen.preparada))}
                                  onClick={() => setEntregar(item)}
                                >
                                  Registrar recepción
                                </Button>
                              </>
                            )}
                            {pendienteItem === 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                                <CheckCircle size={14} /> Completo
                              </span>
                            )}
                            {op.estado === 'en_transito' && pendienteItem > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Al emitir la guía o guardar la recepción, la carga pasará a Entregando
                              </span>
                            )}
                          </div>
                        </div>
                        {entregasActivas.length > 0 && (
                          <details className="mt-2 pl-10 text-xs text-gray-500 dark:text-gray-400">
                            <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                              Ver {entregasActivas.length} recepción{entregasActivas.length === 1 ? '' : 'es'}
                            </summary>
                            <ul className="mt-2 space-y-1">
                              {entregasActivas.map((entrega) => (
                                <li key={entrega.id_entrega}>
                                  {entrega.fecha_entrega.slice(0, 10).split('-').reverse().join('/')} · {entrega.cantidad_entregada} recibidas · {entrega.cantidad_rechazada || 0} rechazadas
                                  {entrega.nombre_recibe ? ` · Recibió: ${entrega.nombre_recibe}` : ''}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {preparando && (
          <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
            {op.flujo.pendientes.length > 0 && (
              <details className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <summary className="cursor-pointer font-semibold">
                  Ver lo que falta ({op.flujo.pendientes.length})
                </summary>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {op.flujo.pendientes.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </details>
            )}
            <Button
              disabled={!op.resumen.preparada || op.estado !== 'en_curso' || busy}
              onClick={() => setConfirmar(true)}
            >
              Confirmar salida
            </Button>
          </div>
        )}
        {op.estado === 'repartiendo' && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {op.resumen.itemsResueltos} de {op.resumen.totalItems} destinos completos
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {op.resumen.saldoEntrega} jabas pendientes
              </p>
            </div>
            <Button disabled={busy || !op.resumen.conciliada} onClick={cerrar}>
              Finalizar carga
            </Button>
          </div>
        )}
      </section>
      </>}
      <ConfirmDialog
        isOpen={confirmarFinalizacion}
        onClose={() => { if (!busy) setConfirmarFinalizacion(false); }}
        onConfirm={() => avanzar('completado')}
        title="Finalizar entregas"
        message={`¿Finalizar las entregas de la carga #${id}? La operación quedará completada y disponible solo para consulta.`}
        confirmText="Finalizar entregas"
        cancelText="Cancelar"
        variant="success"
        icon={<CheckCircle size={24} />}
      />
      {confirmar && (
        <Modal
          isOpen
          onClose={() => {
            if (!busy) setConfirmar(false);
          }}
          className="max-w-lg"
        >
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              ¿Confirmar la salida?
            </h2>
            <p className="text-sm text-gray-500">
              {op.detalle_carga.length} productos · {op.flujo.totalItems} destinos. La carga pasará a tránsito.
            </p>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setConfirmar(false)}
              >
                Volver
              </Button>
              <Button disabled={busy} onClick={confirmarCarga}>
                {busy ? 'Confirmando…' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {asignar !== null && (
        <ItemRepartoSimpleForm
          key={asignar}
          isOpen
          operacionId={id}
          defaultDetalleId={asignar}
          onClose={() => setAsignar(null)}
          onSuccess={() => {
            setAsignar(null);
            void load();
          }}
        />
      )}
      {resolver && <ResolucionRepartoModal item={resolver} onClose={() => setResolver(null)} onSaved={load} />}
      {entregar && (
        <EntregaProcesoModal
          operacionId={op.id_operacion}
          key={entregar.id_item_reparto}
          item={entregar}
          fechaCarga={op.fecha_carga}
          onClose={() => setEntregar(null)}
          onSaved={load}
        />
      )}
      {editar && (
        <DetalleCargaModal
          isOpen
          operacionId={id}
          editingDetalle={editar}
          onClose={() => { setEditar(null); }}
          onSaved={() => {
            setEditar(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
