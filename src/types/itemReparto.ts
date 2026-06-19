// types/ItemReparto.ts

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

    // Relaciones
    clientes?: {
        id_cliente: number;
        nombres: string;
        apellidos?: string;
        telefono?: string;
    };
    puestos?: {
        id_puesto: number;
        numero_puesto: string;
        lugares_operativos?: {   // 👈 Agregado
            id_lugar: number;
            nombre: string;
            // otros campos si los usas
        };
    };
    detalle_carga?: any;
    items_reparto_detalle?: any[];
    guias_operativas?: any[];

    // Propiedades virtuales (agregadas por el backend)
    guia_asociada?: any;
    _total_asignado_agrupado?: number;
    _items_del_puesto?: any[];
    _todas_las_calidades?: any[];
    _clientes_agrupados?: string[];
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