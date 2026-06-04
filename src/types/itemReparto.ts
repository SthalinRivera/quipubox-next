export interface ItemReparto {
    id_item_reparto: number;
    id_empresa: number;
    id_detalle_carga: number;
    id_cliente_receptor?: number | null;
    id_puesto: number;
    cantidad_asignada: number;
    orden_entrega?: number | null;
    observaciones?: string | null;
    created_at: string;
    seccion?: string | null;
    clientes?: { id_cliente: number; nombres: string; apellidos?: string };
    puestos?: { id_puesto: number; numero_puesto: string };
    detalle_carga?: any;
}

export interface CreateItemRepartoDto {
    id_detalle_carga: number;
    id_cliente_receptor?: number | null;
    id_puesto: number;
    cantidad_asignada: number;
    orden_entrega?: number | null;
    observaciones?: string | null;
    seccion?: string;
}