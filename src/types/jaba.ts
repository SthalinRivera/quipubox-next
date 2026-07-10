export interface JabaPorPagar {
    id_jaba_pagar: number;
    id_empresa: number;
    id_entrega?: number | null;
    id_cliente_emisor: number;
    id_tipo_jaba: number;
    fecha_origen: string;
    cantidad_original: number;
    cantidad_pagada: number;
    saldo_pendiente: number;
    estado: 'pendiente' | 'parcial' | 'completado' | 'observado' | 'anulado';
    observaciones?: string;
    created_at: string;
    clientes?: { nombres: string; apellidos?: string };
    tipos_jaba?: { nombre: string };
}

export interface JabaPorCobrar {
    id_jaba_cobrar: number;
    id_empresa: number;
    id_entrega: number;
    id_tipo_jaba: number;
    fecha_origen: string;
    cantidad_original: number;
    cantidad_recuperada: number;
    saldo_pendiente: number;
    estado: 'pendiente' | 'parcial' | 'completado' | 'observado' | 'anulado';
    seccion?: string;
    observaciones?: string;
    created_at: string;
    clientes?: { nombres: string; apellidos?: string };
    tipos_jaba?: { nombre: string };
}

export interface DevolucionEmisor {
    id_devolucion: number;
    id_empresa: number;
    id_jaba_pagar: number;
    fecha_devolucion: string;
    tipo_devolucion: 'jabas_fisicas' | 'vale_canjeado' | 'ajuste' | 'perdida_asumida';
    cantidad: number;
    id_usuario_responsable?: number;
    observaciones?: string;
    created_at: string;
    saldo_resultante: number;
}

export interface RecuperacionJaba {
    id_recuperacion: number;
    id_empresa: number;
    id_jaba_cobrar: number;
    fecha_recuperacion: string;
    tipo_recuperacion: 'vale' | 'recojo_puesto' | 'recojo_almacen' | 'ajuste' | 'perdida';
    cantidad: number;
    id_usuario_responsable?: number;
    observaciones?: string;
    created_at: string;
    saldo_resultante: number;
}