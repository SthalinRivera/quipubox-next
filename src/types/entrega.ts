import { ItemReparto } from "./itemReparto";

export interface Entrega {
  id_entrega: number;
  id_empresa: number;
  id_guia: number;
  id_item_reparto: number;
  id_entregador?: number | null;
  fecha_entrega: string;
  hora_entrega?: string | null;
  cantidad_entregada: number;
  cantidad_rechazada: number;
  estado_entrega: string;
  firma_recibido: boolean;
  nombre_recibe?: string | null;
  observaciones?: string | null;
  created_at: string;
  guias_operativas?: { numero_guia: string };
  items_reparto?: ItemReparto;
  usuarios?: { nombres: string; apellidos?: string };
}

export interface CreateEntregaDto {
  id_guia: number;
  id_item_reparto: number;
  id_entregador?: number | null;
  fecha_entrega: string;
  hora_entrega?: string | null;
  cantidad_entregada: number;
  cantidad_rechazada?: number;
  estado_entrega: string;
  firma_recibido?: boolean;
  nombre_recibe?: string | null;
  observaciones?: string | null;
}