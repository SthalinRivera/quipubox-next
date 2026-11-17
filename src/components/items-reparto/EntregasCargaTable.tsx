'use client';

import Link from 'next/link';
import { CheckCircle, FileText, History, Info, Package, User, Hourglass } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { guiaVigente, saldoDestino, type DestinoFlujo, type OperacionFlujo } from '@/types/flujoOperacion';
import type { DetalleCarga } from '@/types/detalleCarga';

interface Props {
  op: OperacionFlujo;
  busy: boolean;
  editable: boolean;
  onAsignar: (id: number) => void;
  onEditar: (detalle: DetalleCarga) => void;
  onEmitir: (id: number) => void;
  onRecibir: (item: DestinoFlujo) => void;
  onResolver: (item: DestinoFlujo) => void;
  onQuitar: (id: number) => void;
  onAnular: (id: number) => void;
}

export default function EntregasCargaTable({ op, busy, editable, onAsignar, onEditar, onEmitir, onRecibir, onResolver, onQuitar, onAnular }: Props) {
  const enEntrega = ['en_transito', 'repartiendo'].includes(op.estado);
  const destinos = op.detalle_carga.flatMap(d => d.items_reparto);
  const historial = op.detalle_carga.flatMap(d => d.items_reparto.flatMap(item =>
    item.entregas.map(entrega => ({ ...entrega, producto: d.frutas?.nombre, receptor: item.clientes?.nombres })),
  ));
  const row = 'grid gap-4 px-4 py-5 lg:grid-cols-[1.3fr_1fr_.6fr_1fr_.9fr_1.5fr] lg:items-center';

  return (
    <div className="mt-5">
      <div className={`${row} hidden rounded-t-xl bg-gray-50 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:grid dark:bg-gray-800 dark:text-gray-400`}>
        {['Producto', 'Destinatario', 'Jabas', 'Recepción', 'Guía', 'Acciones'].map(label => <div key={label}>{label}</div>)}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {op.detalle_carga.map(detalle => {
          const asignadas = detalle.items_reparto.reduce((sum, item) => sum + item.cantidad_asignada, 0);
          const clasificadas = (detalle.detalle_carga_calidades || []).reduce((sum, c) => sum + c.cantidad, 0);
          const lista = !detalle.es_reparto || clasificadas === detalle.cantidad_jabas;
          return (
            <div key={detalle.id_detalle_carga}>
              {detalle.items_reparto.map(item => {
                const recibidas = item.entregas.filter(e => e.estado_entrega !== 'pendiente').reduce((sum, e) => sum + e.cantidad_entregada, 0);
                const resueltas = (item.resoluciones_reparto || []).reduce((sum, r) => sum + r.cantidad, 0);
                const pendiente = saldoDestino(item);
                const guia = item.guias_operativas.find(g => !['anulada', 'reemplazada'].includes(g.estado) && g.cobertura);
                const porcentaje = item.cantidad_asignada ? Math.min(100, Math.round(recibidas / item.cantidad_asignada * 100)) : 0;
                return (
                  <div key={item.id_item_reparto} className={`${row} border-b border-gray-100 last:border-b-0 dark:border-gray-800`}>
                    <div className="flex items-start gap-3">
                      <span className="rounded-xl bg-gray-50 p-2 text-gray-500 dark:bg-gray-800"><Package size={22} /></span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{detalle.frutas?.nombre || 'Producto'}</p>
                        <p className={`mt-1 text-xs ${lista ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {detalle.es_reparto ? `Clasificación: ${clasificadas}/${detalle.cantidad_jabas}` : 'Entrega directa'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User size={19} className="shrink-0 text-gray-400" />
                      <div><p className="font-medium text-gray-900 dark:text-white">{item.clientes?.nombres || 'Sin receptor'}</p><p className="text-xs text-gray-500">Puesto {item.puestos?.codigo_puesto || 'sin asignar'}</p></div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{item.cantidad_asignada}<span className="ml-1 font-normal text-gray-500 lg:hidden">jabas</span></div>
                    <div>
                      <p className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{recibidas} / {item.cantidad_asignada}</p>
                      <div role="progressbar" aria-label={`Recepción de ${detalle.frutas?.nombre} para ${item.clientes?.nombres}`} aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} className="my-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${porcentaje}%` }} />
                      </div>
                      <p className="text-xs text-gray-500">{pendiente} pendientes{resueltas > 0 ? ` · ${resueltas} resueltas` : ''}</p>
                    </div>
                    <div>
                      {guia ? <Link href={`/dashboard/guias-operativas/${guia.id_guia}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"><FileText size={16} />{guia.numero_guia}</Link>
                        : <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><Hourglass size={14} />{pendiente > 0 ? 'Pendiente' : 'Sin guía vigente'}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {enEntrega && pendiente > 0 && <>
                        {!guiaVigente(item) && <Button size="sm" variant="outline" disabled={busy || !item.clientes || !item.puestos} onClick={() => onEmitir(item.id_item_reparto)} startIcon={<FileText size={16} />}>Emitir guía</Button>}
                        <Button size="sm" disabled={busy || !guiaVigente(item)} onClick={() => onRecibir(item)} startIcon={<CheckCircle size={16} />}>Recibir</Button>
                      </>}
                      {pendiente === 0 && <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400"><CheckCircle size={16} />{recibidas >= item.cantidad_asignada ? 'Recibido' : 'Resuelto'}</span>}
                      <details className="w-full text-xs text-gray-500">
                        <summary className="cursor-pointer py-1 hover:text-brand-600">Más opciones y documentos</summary>
                        <div className="mt-2 space-y-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                          {item.guias_operativas.map(g => <div key={g.id_guia} className="space-y-1">
                            <Link className="text-brand-600 hover:underline dark:text-brand-300" href={`/dashboard/guias-operativas/${g.id_guia}`}>{g.numero_guia} · {g.estado}{!g.cobertura ? ' · histórica sin cobertura' : ''}</Link>
                            <p>{(g.cobertura?.calidades || []).map(c => `${c.nombre}: ${c.cantidad} jabas`).join(' · ')}</p>
                            {enEntrega && !['anulada', 'reemplazada'].includes(g.estado) && <button type="button" disabled={busy} className="block py-1 text-red-600 disabled:opacity-50" onClick={() => onAnular(g.id_guia)}>Anular guía</button>}
                          </div>)}
                          {!item.guias_operativas.length && <p>No hay documentos emitidos.</p>}
                          {op.estado === 'repartiendo' && pendiente > 0 && <Button size="sm" variant="outline" disabled={busy} onClick={() => onResolver(item)}>Resolver faltante</Button>}
                          {editable && detalle.es_reparto && <Button size="sm" variant="outline" disabled={busy} onClick={() => onQuitar(item.id_item_reparto)}>Quitar destino</Button>}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
              {(asignadas < detalle.cantidad_jabas || !detalle.items_reparto.length) && (
                <div className="m-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-3 dark:border-amber-500/30 dark:bg-amber-500/5">
                  <div><p className="text-sm font-medium text-gray-800 dark:text-gray-200">{detalle.frutas?.nombre} · {Math.max(0, detalle.cantidad_jabas - asignadas)} jabas sin destinatario</p><p className="text-xs text-gray-500">Puedes continuar con los destinos que ya están asignados.</p></div>
                  {editable && <Button size="sm" variant="outline" disabled={busy || !lista} onClick={() => detalle.es_reparto ? onAsignar(detalle.id_detalle_carga) : onEditar(detalle)}>{detalle.es_reparto ? 'Asignar receptor' : 'Completar receptor'}</Button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <Info size={18} className="shrink-0" /> Emite la guía de cada puesto para habilitar su recepción. No necesitas esperar a los demás.
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{destinos.length} destinos · {destinos.reduce((sum, item) => sum + item.cantidad_asignada, 0)} jabas asignadas</p>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-brand-600 dark:text-brand-300"><History size={16} className="mr-2 inline" />Ver historial de recepciones ({historial.length})</summary>
          <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
            {historial.map(e => <li key={e.id_entrega} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">{e.producto} · {e.receptor} · {e.cantidad_entregada} recibidas · {e.cantidad_rechazada || 0} rechazadas · {e.fecha_entrega.slice(0, 10)} · {e.nombre_recibe || 'Sin nombre'} · {e.estado_entrega}</li>)}
            {!historial.length && <li>Aún no hay recepciones registradas.</li>}
          </ul>
        </details>
      </div>
    </div>
  );
}