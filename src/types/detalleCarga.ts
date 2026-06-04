export interface DetalleCarga {
    id_detalle_carga: number;
    id_empresa: number;
    id_operacion: number;
    id_cliente_emisor: number;
    id_fruta: number;
    id_variedad?: number | null;
    id_tipo_jaba: number;
    cantidad_jabas: number;
    es_reparto: boolean;
    instruccion_reparto?: string | null;
    observaciones?: string | null;
    created_at: string;
    requiere_retorno_jabas: boolean;
    // Relaciones
    clientes?: { id_cliente: number; nombres: string; apellidos?: string };
    frutas?: { id_fruta: number; nombre: string };
    variedades?: { id_variedad: number; nombre: string };
    tipos_jaba?: { id_tipo_jaba: number; nombre: string };
    detalle_carga_calidades?: DetalleCalidad[];
}

export interface DetalleCalidad {
    id_detalle_carga_calidad: number;
    id_detalle_carga: number;
    id_calidad: number;
    cantidad: number;
    precio_unitario?: number | null;
    calidades?: { id_calidad: number; nombre: string };
}

export interface CreateDetalleCargaDto {
    id_cliente_emisor: number;
    id_fruta: number;
    id_variedad?: number | null;
    id_tipo_jaba: number;
    cantidad_jabas: number;
    es_reparto?: boolean;
    instruccion_reparto?: string | null;
    observaciones?: string | null;
    requiere_retorno_jabas?: boolean;
}

export interface CreateDetalleCalidadDto {
    id_calidad: number;
    cantidad: number;
    precio_unitario?: number | null;
}