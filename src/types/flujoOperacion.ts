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
  guias_operativas: { id_guia: number; numero_guia: string; estado: string }[];
}
export interface OperacionFlujo {
  id_operacion: number;
  estado: string;
  fecha_carga: string;
  camiones?: { placa: string };
  detalle_carga: (DetalleCarga & { items_reparto: DestinoFlujo[] })[];
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
export const cancelada = (estado?: string) =>
  estado === 'cancelado' || estado === 'cancelada';
export const saldoDestino = (item: DestinoFlujo) =>
  Math.max(
    0,
    item.cantidad_asignada -
      item.entregas
        .filter((e) => e.estado_entrega !== 'pendiente')
        .reduce((sum, e) => sum + e.cantidad_entregada, 0),
  );
export const estadoOperacion: Record<string, string> = {
  pendiente: 'Carga pendiente',
  en_curso: 'Preparando carga',
  en_transito: 'Lista para entregar',
  repartiendo: 'Entregas en curso',
  completado: 'Entregas completadas',
  cancelado: 'Cancelada',
  cancelada: 'Cancelada',
};
