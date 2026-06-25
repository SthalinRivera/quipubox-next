// src/types/incidencia.ts
export interface Incidencia {
    id_incidencia: number;
    id_empresa: number;
    fecha_incidencia: string;      // formato ISO (YYYY-MM-DD)
    hora_incidencia?: string | null;
    id_operacion?: number | null;
    id_guia?: number | null;
    id_entrega?: number | null;
    tipo_incidencia: string;       // "robo", "daño", "devolución", "otro"
    descripcion: string;
    accion_tomada?: string | null;
    id_usuario_reporta?: number | null;
    estado: string;                // "abierta" | "cerrada"
    created_at?: string | null;
    // Relaciones (opcional)
    empresas?: any;
    usuarios?: any;
    entregas?: any;
    guias_operativas?: any;
    operaciones_carga?: any;
    // Evidencias (se cargan por separado)
    evidencias?: Evidencia[];
}

export interface Evidencia {
    id_evidencia: number;
    id_empresa: number;
    tipo_entidad: string;
    id_entidad: number;
    url_archivo: string;
    tipo_archivo?: string | null;
    descripcion?: string | null;
    subido_por?: number | null;
    created_at?: string | null;
}