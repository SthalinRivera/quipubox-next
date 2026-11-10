'use client';

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowLeft,
  Plus,
  Package,
  Layers,
  Truck,
  FileText,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import { Stepper } from '@/components/ui/Stepper';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import ItemRepartoSimpleForm from '@/components/items-reparto/ItemRepartoSimpleForm';
import EntregaProcesoModal from '@/components/entregas/EntregaProcesoModal';
import { CalidadesProcesoModal } from '@/components/detalle-carga/CalidadesProcesoModal';
import { DetalleCargaModal } from '@/components/detalle-carga/DetalleCargaModal';
import {
  cargaEditable,
  operacionAbierta,
  guiaVigente,
  saldoDestino,
  estadoOperacion,
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
  const [entregar, setEntregar] = useState<DestinoFlujo | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState(false);
  const [calidadId, setCalidadId] = useState<number | null>(null);
  const [editar, setEditar] = useState<DetalleCarga | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('agregarProducto') !== '1' || !op) return;
    if (cargaEditable(op.estado)) setNuevoProducto(true);
    url.searchParams.delete('agregarProducto');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [op]);
  const load = useCallback(async () => {
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('La operaciÃ³n no es vÃ¡lida.');
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
        e instanceof Error ? e.message : 'No se pudo cargar la operaciÃ³n.',
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
  const ejecutar = async (ruta: string, method: 'POST' | 'PATCH', body?: { estado: string }) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await fetchWithAuth(ruta, { method, ...(body ? { body } : {}) }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar la acción.'); }
    finally { setBusy(false); }
  };
  const avanzar = (estado: string) => ejecutar(`operaciones-carga/${id}/estado`, 'PATCH', { estado });
  const emitirGuias = () => ejecutar(`operaciones-carga/${id}/generar-guias`, 'POST');
  const cerrar = () => { if (window.confirm('¿Cerrar esta operación? Quedará disponible solo para consulta.')) void avanzar('completado'); };
  const eliminar = async (detalle: DetalleCarga) => {
    if (
      !window.confirm(
        `Â¿Eliminar la carga de ${detalle.cantidad_jabas} jabas de ${detalle.frutas?.nombre || 'este producto'}?`,
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
  const quitarDestino = async (itemId: number) => {
    if (
      !window.confirm(
        'Â¿Quitar este destino? PodrÃ¡s asignar nuevamente las jabas antes de confirmar la carga.',
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
          {error || 'Cargando la operaciÃ³nâ€¦'}
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
  const guias = destinos.flatMap(item => item.guias_operativas.map(g => ({ ...g, cliente: item.clientes?.nombres })));
  const faltanGuias = destinos.some(item => !guiaVigente(item));
  const totalJabas = op.resumen.jabasCargadas;
  const recibidas = entregas.filter(e => e.estado_entrega !== 'pendiente').reduce((sum,e) => sum + e.cantidad_entregada, 0);
  const porClasificar = op.detalle_carga.filter((d) => d.es_reparto && (d.detalle_carga_calidades || []).reduce((sum, c) => sum + c.cantidad, 0) !== d.cantidad_jabas);
  const porAsignar = op.detalle_carga.filter((d) => d.items_reparto.reduce((sum, item) => sum + item.cantidad_asignada, 0) !== d.cantidad_jabas);
  const siguienteDestino = destinos.find((item) => saldoDestino(item) > 0);
  const primeraCalidad = porClasificar[0];
  const primerDestino = porAsignar[0];
  const abrirSeccion = (seccion: string) => { window.location.hash = seccion; };
  const siguiente = !op.detalle_carga.length && editable
    ? { title: 'Agrega el primer producto', detail: '', label: 'Agregar producto', action: () => setNuevoProducto(true) }
    : editable && primeraCalidad
      ? { title: 'Completa las calidades', detail: primeraCalidad.frutas?.nombre || '', label: 'Clasificar', action: () => setCalidadId(primeraCalidad.id_detalle_carga) }
      : editable && primerDestino
        ? { title: 'Asigna los receptores', detail: primerDestino.frutas?.nombre || '', label: 'Asignar', action: () => setAsignar(primerDestino.id_detalle_carga) }
        : op.estado === 'pendiente'
          ? { title: 'Comienza la preparación', detail: '', label: 'Iniciar carga', action: () => avanzar('en_curso') }
          : preparando
            ? { title: op.resumen.preparada ? 'Carga preparada' : 'Revisa los desgloses', detail: '', label: op.resumen.preparada ? 'Confirmar salida' : 'Revisar', action: () => op.resumen.preparada ? setConfirmar(true) : abrirSeccion('calidad') }
            : (op.estado === 'en_transito' || op.estado === 'repartiendo') && faltanGuias
              ? { title: 'Emite las guías pendientes', detail: '', label: 'Emitir guías', action: emitirGuias }
              : op.estado === 'en_transito'
                ? { title: 'Listo para comenzar el reparto', detail: '', label: 'Iniciar reparto', action: () => avanzar('repartiendo') }
                : op.estado === 'repartiendo' && op.resumen.conciliada
                  ? { title: 'Toda la carga está conciliada', detail: 'El responsable puede cerrar la operación.', label: 'Cerrar operación', action: cerrar }
                  : op.estado === 'repartiendo' && siguienteDestino
                    ? { title: `Entrega a ${siguienteDestino.clientes?.nombres || 'este receptor'}`, detail: `${saldoDestino(siguienteDestino)} jabas pendientes`, label: 'Registrar entrega', action: () => setEntregar(siguienteDestino) }
                    : { title: op.estado === 'completado' ? 'Operación completada' : 'Revisa los pendientes', detail: '', label: 'Ver registros', action: () => abrirSeccion('entregas') };
  const preparacion = [
    { label: 'Productos', value: op.detalle_carga.length ? `${op.detalle_carga.length} registrados` : 'Agrega el primero', done: op.detalle_carga.length > 0, href: '#carga' },
    { label: 'Calidades', value: !op.detalle_carga.length ? 'DespuÃ©s de agregar productos' : !op.flujo.requiereCalidad ? 'No requiere clasificaciÃ³n' : porClasificar.length ? `${porClasificar.length} por completar` : 'Completas', done: op.detalle_carga.length > 0 && porClasificar.length === 0, href: '#calidad' },
    { label: 'Receptores y puestos', value: !op.detalle_carga.length ? 'DespuÃ©s de agregar productos' : porAsignar.length ? `${porAsignar.length} por completar` : 'Asignados', done: op.detalle_carga.length > 0 && porAsignar.length === 0, href: '#calidad' },
  ];
  return (
    <div className="mx-auto max-w-full space-y-4 pb-6">
      <Link
        href="/dashboard/operaciones-carga"
        className="inline-flex items-center gap-2 text-sm text-gray-500"
      >
        <ArrowLeft size={16} /> Todas las cargas
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
            Operaciones
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Carga #{id}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            CamiÃ³n {op.camiones?.placa} Â·{' '}
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
      <Stepper operacion={op} />
      {(editable || op.detalle_carga.length > 0) && <div className="overflow-hidden rounded-xl border border-brand-200 bg-brand-50/60 dark:border-brand-500/25 dark:bg-brand-500/5">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div><p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{(op.estado === 'completado') ? 'Todo listo' : 'QuÃ© falta Â· Siguiente paso'}</p><h2 className="text-base font-semibold text-gray-900 dark:text-white">{siguiente.title}</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{siguiente.detail}</p></div>
          <Button disabled={busy} onClick={siguiente.action}>{siguiente.label}<span aria-hidden="true">â†’</span></Button>
        </div>
        {preparando && <ol className="grid border-t border-brand-200/60 bg-white/70 sm:grid-cols-3 dark:border-brand-500/20 dark:bg-gray-900/50">
          {preparacion.map((paso, index) => <li key={paso.label}><a href={paso.href} className="flex items-center gap-3 p-3 text-sm hover:bg-brand-50 dark:hover:bg-brand-500/10"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${paso.done ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>{paso.done ? <CheckCircle size={16} /> : index + 1}</span><span><span className="block font-medium text-gray-900 dark:text-white">{paso.label}</span><span className="block text-xs text-gray-500 dark:text-gray-400">{paso.value}</span></span></a></li>)}
        </ol>}
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
            Agrega un producto para comenzar. Luego podrÃ¡s completar sus calidades y receptores.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {op.detalle_carga.map((d) => (
              <article
                key={d.id_detalle_carga}
                className="flex min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                aria-label={`${d.frutas?.nombre || 'Producto'} Â· ${d.cantidad_jabas} jabas`}
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
                  <span className="pb-1 text-xs font-medium text-gray-600 dark:text-gray-300">{d.tipos_jaba?.nombre || 'â€”'}</span>
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
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Layers size={20} /> 2. Calidad Â· Destinos
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
                    {d.frutas?.nombre} Â· {d.cantidad_jabas} jabas
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {d.es_reparto
                      ? `Calidad: ${clasificado} de ${d.cantidad_jabas} jabas`
                      : 'No requiere calidad'}{' '}
                    Â· Con receptor: {asignado} de {d.cantidad_jabas}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.es_reparto && (
                    <Button variant="outline" onClick={() => setCalidadId(d.id_detalle_carga)}>
                      {listo || !editable ? 'Ver calidades' : 'Completar calidades'}
                    </Button>
                  )}
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
                  {editable && !listo && <span className="w-full text-xs text-amber-700 dark:text-amber-400">Completa las calidades para asignar receptores.</span>}
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
        {editable && (
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
          <FileText size={20} /> 5. GuÃ­as
        </h2>
        {['en_transito', 'repartiendo'].includes(op.estado) && faltanGuias && <Button className="mt-3" disabled={busy || !op.resumen.preparada} onClick={emitirGuias}>Emitir pendientes</Button>}
        <div className="mt-4 flex flex-wrap gap-3">
          {guias.map((g) => (
            <Link
              key={g.id_guia}
              className={link}
              href={`/dashboard/guias-operativas/${g.id_guia}`}
            >
              GuÃ­a {g.numero_guia} Â· {g.cliente}
            </Link>
          ))}
          {!guias.length && (
            <p className="text-sm text-gray-500">
              Las guÃ­as estarÃ¡n disponibles despuÃ©s de registrar una entrega.
            </p>
          )}
        </div>
      </section>
      <section id="entregar" className={card}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Truck size={20} /> 4. Entregas
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {editable
            ? 'Se habilita al completar calidades y receptores, y confirmar la carga.'
            : cancelled ? 'Consulta los registros de esta carga cancelada.' : 'Elige un receptor y registra las jabas que recibiÃ³.'}
        </p>
        <div className="mt-4 space-y-3">
          {destinos.map((item) => (
            <div
              key={item.id_item_reparto}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.clientes?.nombres} Â· Puesto{' '}
                  {item.puestos?.numero_puesto}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {item.producto} Â· {item.cantidad_asignada} asignadas Â·{' '}
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
            Las entregas aparecerÃ¡n aquÃ­ despuÃ©s de registrarlas.
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. Cierre</h2>
        <p className="my-3 text-sm text-gray-500">{op.resumen.itemsResueltos}/{op.resumen.totalItems} destinos resueltos · {op.resumen.saldoEntrega} jabas pendientes · {op.resumen.jabasSinAsignar} sin asignar</p>
        {op.estado === 'repartiendo' && <Button disabled={busy || !op.resumen.conciliada} onClick={cerrar}>Cerrar operación</Button>}
        {op.estado === 'completado' && <p className="text-sm text-green-700">Operación completada</p>}
      </section>
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
              Â¿La carga estÃ¡ lista para entregar?
            </h2>
            <p className="text-sm text-gray-500">
              {op.detalle_carga.length} productos Â· {op.flujo.totalItems} destinos. No podrÃ¡s editarlos despuÃ©s.
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
                {busy ? 'Confirmandoâ€¦' : 'Confirmar'}
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
      {entregar && (
        <EntregaProcesoModal
          key={entregar.id_item_reparto}
          item={entregar}
          fechaCarga={op.fecha_carga}
          onClose={() => setEntregar(null)}
          onSaved={load}
        />
      )}
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
    </div>
  );
}
