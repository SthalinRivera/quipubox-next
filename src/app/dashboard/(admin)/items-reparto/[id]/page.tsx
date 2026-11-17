'use client';

import { OperationSkeleton } from '@/components/ui/skeleton/OperationSkeleton';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowLeft,
  Truck,
  Package, Layers, Hourglass,

} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import EntregasCargaTable from '@/components/items-reparto/EntregasCargaTable';
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
  const guiasPendientes = destinos.filter(item => saldoDestino(item) > 0 && !guiaVigente(item)).length;
  const faltanGuias = guiasPendientes > 0;
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
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Entregas de la carga #{id}
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
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Productos', value: op.detalle_carga.length, Icon: Package },
          { label: 'Jabas totales', value: totalJabas, Icon: Layers },
          { label: 'Recibidas', value: recibidas, Icon: CheckCircle },
          { label: 'Pendientes', value: op.resumen.saldoEntrega + op.resumen.jabasSinAsignar, Icon: Hourglass },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-gray-900">
            <Icon size={26} className="shrink-0 text-gray-400" aria-hidden="true" />
            <div className="border-l border-gray-200 pl-4 dark:border-gray-700">
              <dd className="text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">{value}</dd>
              <dt className="text-sm text-gray-500">{label}</dt>
            </div>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Avance de recepción</span>
        <div role="progressbar" aria-label="Avance de recepción total" aria-valuemin={0} aria-valuemax={100} aria-valuenow={totalJabas ? Math.min(100, Math.round(recibidas / totalJabas * 100)) : 0} className="h-2.5 min-w-24 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${totalJabas ? Math.min(100, recibidas / totalJabas * 100) : 0}%` }} />
        </div>
        <span className="text-sm tabular-nums text-gray-500">{recibidas} de {totalJabas} jabas · {totalJabas ? Math.round(recibidas / totalJabas * 100) : 0}%</span>
      </div>
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
            <Truck size={22} /> Detalle de entregas
          </h2>
          {op.estado === 'en_transito' && destinos.some(item => item.clientes && item.puestos && item.cantidad_asignada > 0) && (
            <Button disabled={busy} variant="outline" onClick={() => avanzar('repartiendo')}>
              Iniciar entregas
            </Button>
          )}
          {['en_transito', 'repartiendo'].includes(op.estado) && faltanGuias && (
            <Button disabled={busy} onClick={emitirGuias}>
              Emitir {guiasPendientes} guías pendientes
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">Gestiona cada puesto por separado: emite su guía y registra lo recibido.</p>
        <EntregasCargaTable
          op={op} busy={busy} editable={editable}
          onAsignar={setAsignar} onEditar={setEditar}
          onEmitir={itemId => { void ejecutar(`operaciones-carga/${id}/destinos/${itemId}/emitir-guia`, 'POST'); }}
          onRecibir={setEntregar} onResolver={setResolver}
          onQuitar={quitarDestino}
          onAnular={guiaId => {
            if (window.confirm('¿Anular esta guía? Solo es posible si aún no tiene entregas.'))
              void ejecutar(`guias-operativas/${guiaId}`, 'DELETE');
          }}
        />
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
