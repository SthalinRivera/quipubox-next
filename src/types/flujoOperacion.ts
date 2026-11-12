import type { DetalleCarga } from './detalleCarga';
export interface EntregaFlujo {
  id_entrega: number;
  cantidad_entregada: number;
  cantidad_rechazada: number | null;
  estado_entrega: string;
  nombre_recibe: string | null;
  fecha_entrega: string;
}
export interface DestinoFlujo {
  id_item_reparto: number;
  cantidad_asignada: number;
  clientes?: { nombres: string; apellidos?: string | null };
  puestos?: { numero_puesto: string };
  entregas: EntregaFlujo[];
  resoluciones_reparto?: { cantidad: number; tipo: string; motivo: string }[];
  guias_operativas: { id_guia: number; numero_guia: string; estado: string; cobertura?: { cantidad: number; id_item_reparto: string } | null }[];
}
export interface OperacionFlujo {
  id_operacion: number;
  estado: string;
  fecha_carga: string;
  camiones?: { placa: string };
  detalle_carga: (DetalleCarga & { items_reparto: DestinoFlujo[] })[];
  resumen: {
    jabasCargadas: number; jabasAsignadas: number; jabasSinAsignar: number;
    jabasSinClasificar: number; desglosesIncompletos: number; puestosDistintos: number;
    totalItems: number; itemsResueltos: number; saldoEntrega: number; progreso: number;
    preparada: boolean; conciliada: boolean;
  };
  flujo: {
    pendientes: string[];
    calidadPendiente: number;
    destinoPendiente: number;
    totalItems: number;
    entregados: number;
    requiereCalidad: boolean;
    listaParaEntregar: boolean;
    entregasCompletas: boolean;
  };
}
export const cargaEditable = (estado?: string) =>
  estado === 'pendiente' || estado === 'en_curso';
export const operacionAbierta = (estado?: string) =>
  ['pendiente', 'en_curso', 'en_transito', 'repartiendo'].includes(estado || '');
export const guiaVigente = (item: DestinoFlujo) => item.guias_operativas.find(g => !['anulada', 'reemplazada'].includes(g.estado) && !!g.cobertura);
export const saldoDestino = (item: DestinoFlujo) =>
  Math.max(
    0,
    item.cantidad_asignada -
      item.entregas
        .filter((e) => e.estado_entrega !== 'pendiente')
        .reduce((sum, e) => sum + e.cantidad_entregada, 0) - (item.resoluciones_reparto || []).reduce((sum, r) => sum + r.cantidad, 0),
  );
export const estadoOperacion: Record<string, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  en_transito: 'En tránsito',
  repartiendo: 'Repartiendo',
  completado: 'Completado',
};
