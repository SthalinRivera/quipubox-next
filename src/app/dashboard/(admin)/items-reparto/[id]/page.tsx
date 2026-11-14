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
  Trash2,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
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
  const cerrar = () => { if (window.confirm('¿Cerrar esta operación? Quedará disponible solo para consulta.')) void avanzar('completado'); };
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
    })),
  );
  const entregas = destinos.flatMap((item) =>
    item.entregas.map((e) => ({
      ...e,
      cliente: item.clientes?.nombres,
      producto: item.producto,
    })),
  );
  const guias = destinos.flatMap(item => item.guias_operativas.map(g => ({
    ...g,
    cliente: item.clientes?.nombres,
    saldoPendiente: saldoDestino(item),
  })));
  const faltanGuias = destinos.some(item => saldoDestino(item) > 0 && !guiaVigente(item));
  const totalJabas = op.resumen.jabasCargadas;
  const recibidas = entregas.filter(e => e.estado_entrega !== 'pendiente').reduce((sum,e) => sum + e.cantidad_entregada, 0);
  const porAsignar = op.detalle_carga.filter((d) => d.items_reparto.reduce((sum, item) => sum + item.cantidad_asignada, 0) !== d.cantidad_jabas);
  const siguienteDestino = destinos.find((item) => saldoDestino(item) > 0);
  const primerDestino = porAsignar[0];
  const abrirSeccion = (seccion: string) => { window.location.hash = seccion; };
  const habilitada = op.estado !== 'pendiente' && clasificacionCompleta(op);
  const pasoActual = op.estado === 'completado'
    ? 4
    : op.estado === 'repartiendo'
      ? 3
      : op.estado === 'en_transito'
        ? 2
        : 1;
  const pasosProceso = [
    { numero: 1, titulo: 'Preparar destinos', ancla: 'destinos' },
    { numero: 2, titulo: 'Revisar guías', ancla: 'guias' },
    { numero: 3, titulo: 'Registrar entregas', ancla: 'entregar' },
    { numero: 4, titulo: 'Cerrar operación', ancla: 'cierre' },
  ];
  const siguiente = !habilitada
    ? { title: 'Carga pendiente de preparación', detail: 'Completa carga y calidades antes de gestionar entregas.', label: 'Ver carga', action: () => { window.location.href = '/dashboard/operaciones-carga/' + id; } }
    : primerDestino && editable
      ? { title: 'Asigna los receptores', detail: primerDestino.frutas?.nombre || '', label: 'Asignar', action: () => primerDestino.es_reparto ? setAsignar(primerDestino.id_detalle_carga) : setEditar(primerDestino) }
      : preparando
        ? { title: op.resumen.preparada ? 'Destinos preparados' : 'Revisa los destinos', detail: '', label: op.resumen.preparada ? 'Confirmar salida' : 'Revisar', action: () => op.resumen.preparada ? setConfirmar(true) : abrirSeccion('destinos') }
        : ['en_transito', 'repartiendo'].includes(op.estado) && faltanGuias
          ? { title: 'Emite las guías pendientes', detail: '', label: 'Emitir guías', action: emitirGuias }
          : op.estado === 'en_transito'
            ? { title: 'Listo para comenzar el reparto', detail: '', label: 'Iniciar reparto', action: () => avanzar('repartiendo') }
            : op.estado === 'repartiendo' && op.resumen.conciliada
              ? { title: 'Entregas conciliadas', detail: 'El responsable puede cerrar la operación.', label: 'Cerrar operación', action: cerrar }
              : op.estado === 'repartiendo' && siguienteDestino
                ? { title: 'Registra la recepción', detail: siguienteDestino.clientes?.nombres || '', label: 'Registrar entrega', action: () => setEntregar(siguienteDestino) }
                : { title: 'Entregas completadas', detail: '', label: 'Ver registros', action: () => abrirSeccion('entregas') };
  return (
    <div className="mx-auto max-w-full space-y-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/items-reparto"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:hover:text-brand-300"
        >
          <ArrowLeft size={16} /> Volver al listado de operaciones
        </Link>
        <Link href="/dashboard/entregas" className={link}>
          Ver entregas registradas
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
      {habilitada && (
        <nav aria-label="Pasos del proceso de entrega" className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {pasosProceso.map((paso) => {
            const actual = paso.numero === pasoActual;
            const completado = paso.numero < pasoActual;
            return (
              <Link
                key={paso.numero}
                href={`#${paso.ancla}`}
                aria-current={actual ? 'step' : undefined}
                className={`flex min-h-16 items-center gap-3 rounded-xl border p-3 transition-colors ${
                  actual
                    ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10'
                    : 'border-gray-200 bg-white hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  completado
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : actual
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {completado ? <CheckCircle size={16} aria-hidden="true" /> : paso.numero}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{paso.titulo}</span>
              </Link>
            );
          })}
        </nav>
      )}
      {(editable || op.detalle_carga.length > 0) && <div className="overflow-hidden rounded-xl border border-brand-200 bg-brand-50/60 dark:border-brand-500/25 dark:bg-brand-500/5">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div><p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{(op.estado === 'completado') ? 'Todo listo' : 'Qué falta · Siguiente paso'}</p><h2 className="text-base font-semibold text-gray-900 dark:text-white">{siguiente.title}</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{siguiente.detail}</p></div>
          <Button disabled={busy} onClick={siguiente.action}>{siguiente.label}<span aria-hidden="true">→</span></Button>
        </div>
      </div>}
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
      {habilitada && <>
      <section id="destinos" className={card}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Truck size={20} /> 1. Receptores y puestos
        </h2>
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
            return (
              <div
                key={d.id_detalle_carga}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {d.frutas?.nombre} · {d.cantidad_jabas} jabas
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {d.es_reparto
                      ? `Calidad: ${clasificado} de ${d.cantidad_jabas} jabas`
                      : 'No requiere calidad'}{' '}
                    · Con receptor: {asignado} de {d.cantidad_jabas}
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
                  {editable && !listo && <span className="w-full text-xs text-amber-700 dark:text-amber-400">La clasificación debe estar completa antes de asignar receptores.</span>}
                  {listo && asignado === d.cantidad_jabas && (
                    <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
                      <CheckCircle size={16} /> Completo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {preparando && (
          <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
            {op.flujo.pendientes.length > 0 && (
              <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <p className="font-semibold">Pendientes</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {op.flujo.pendientes.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              disabled={!op.resumen.preparada || op.estado !== 'en_curso' || busy}
              onClick={() => setConfirmar(true)}
            >
              Confirmar salida
            </Button>
          </div>
        )}
      </section>
      <section id="guias" className={card}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <FileText size={20} /> 2. Guías
        </h2>
        {['en_transito', 'repartiendo'].includes(op.estado) && faltanGuias && <Button className="mt-3" disabled={busy || !op.resumen.preparada} onClick={emitirGuias}>Emitir pendientes</Button>}
        <div className="mt-4 flex flex-wrap gap-3">
          {guias.map(g => <div key={g.id_guia} className="flex items-center gap-2">
            <Link className={link} href={`/dashboard/guias-operativas/${g.id_guia}`}>Guía {g.numero_guia} · {g.cliente} · {g.estado}</Link>
            {!g.cobertura && <span className="text-xs text-amber-700 dark:text-amber-400">{g.saldoPendiente === 0 ? 'Documento histórico conservado · destino completo' : 'Guía histórica sin cobertura para el saldo pendiente'}</span>}
            {['en_transito','repartiendo'].includes(op.estado) && !['anulada','reemplazada'].includes(g.estado) && <button type="button" disabled={busy} title="Anular guía" aria-label={`Anular guía ${g.numero_guia}`} className="rounded-lg bg-red-50 p-2 text-red-600" onClick={() => { if (window.confirm('¿Anular esta guía? Solo es posible si aún no tiene entregas.')) void ejecutar(`guias-operativas/${g.id_guia}`, 'DELETE'); }}><Trash2 size={16}/></button>}
          </div>)}
          {!guias.length && (
            <p className="text-sm text-gray-500">
              Confirma la salida para emitir las guías.
            </p>
          )}
        </div>
      </section>
      <section id="entregar" className={card}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Truck size={20} /> 3. Entregas
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {op.estado === 'repartiendo' ? 'Registra lo recibido en cada destino.' : 'Emite las guías e inicia el reparto para entregar.'}
        </p>
        <div className="mt-4 space-y-3">
          {destinos.map((item) => (
            <div
              key={item.id_item_reparto}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.clientes?.nombres} · Puesto{' '}
                  {item.puestos?.codigo_puesto}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {item.producto} · {item.cantidad_asignada} asignadas ·{' '}
                  {saldoDestino(item)} pendientes
                </p>
              </div>
              {editable && item.esReparto && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => quitarDestino(item.id_item_reparto)}
                >
                  Quitar
                </Button>
              )}
              {op.estado === 'repartiendo' && saldoDestino(item) > 0 && <Button size="sm" variant="outline" disabled={busy} onClick={() => setResolver(item)}>Resolver saldo</Button>}
              {saldoDestino(item) > 0 ? (
                <Button
                  disabled={op.estado !== 'repartiendo' || !guiaVigente(item) || busy}
                  onClick={() => setEntregar(item)}
                >
                  Registrar entrega
                </Button>
              ) : (
                <span className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle size={16} /> Entrega completa
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
      <section id="entregas" className={card}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Entregas registradas
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {op.resumen.itemsResueltos} de {op.resumen.totalItems} destinos completados.
        </p>
        {!entregas.length ? (
          <p className="mt-4 text-sm text-gray-500">
            Las entregas aparecerán aquí después de registrarlas.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  {[
                    'Receptor',
                    'Fecha',
                    'Recibidas',
                    'Rechazadas',
                    'Recibido por',
                    'Estado',
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap p-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-800 dark:text-gray-200">
                {entregas.map((e) => (
                  <tr key={e.id_entrega}>
                    <td className="p-3">
                      {e.cliente}
                      <span className="block text-xs text-gray-500">
                        {e.producto}
                      </span>
                    </td>
                    <td className="p-3">
                      {e.fecha_entrega
                        .slice(0, 10)
                        .split('-')
                        .reverse()
                        .join('/')}
                    </td>
                    <td className="p-3">{e.cantidad_entregada}</td>
                    <td className="p-3">{e.cantidad_rechazada || 0}</td>
                    <td className="p-3">
                      {e.nombre_recibe || 'Sin registrar'}
                    </td>
                    <td className="p-3">
                      {(
                        {
                          entregado_total: 'Completa',
                          entregado_parcial: 'Parcial',
                          rechazado: 'Rechazada',
                          pendiente: 'Pendiente',
                          observado: 'Observada',
                        } as Record<string, string>
                      )[e.estado_entrega] || e.estado_entrega}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section id="cierre" className={card}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. Cierre</h2>
        <p className="my-3 text-sm text-gray-500">{op.resumen.itemsResueltos}/{op.resumen.totalItems} destinos resueltos · {op.resumen.saldoEntrega} jabas pendientes · {op.resumen.jabasSinAsignar} sin asignar</p>
        {op.estado === 'repartiendo' && <Button disabled={busy || !op.resumen.conciliada} onClick={cerrar}>Cerrar operación</Button>}
        {op.estado === 'completado' && <p className="text-sm text-green-700">Operación completada</p>}
      </section>
      </>}
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
