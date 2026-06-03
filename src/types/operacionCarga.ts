export interface OperacionCarga {
    id_operacion: number;
    id_empresa: number;
    id_sede_origen: number;
    id_sede_destino?: number | null;
    id_camion: number;
    id_encargado_carga?: number | null;
    id_repartidor_asignado?: number | null;
    fecha_carga: string;
    hora_carga?: string | null;
    estado: string;
    observaciones?: string | null;
    created_at: string;
    // Relaciones (opcionales, para mostrar en tabla)
    camiones?: { id_camion: number; placa: string };
    sedes_operaciones_carga_id_sede_origenTosedes?: { id_sede: number; nombre: string };
    sedes_operaciones_carga_id_sede_destinoTosedes?: { id_sede: number; nombre: string };
    usuarios_operaciones_carga_id_encargado_cargaTousuarios?: { id_usuario: number; nombres: string; apellidos: string };
    usuarios_operaciones_carga_id_repartidor_asignadoTousuarios?: { id_usuario: number; nombres: string; apellidos: string };
}

export interface CreateOperacionCargaDTO {
    id_sede_origen: number;
    id_sede_destino?: number | null;
    id_camion: number;
    id_encargado_carga?: number | null;
    id_repartidor_asignado?: number | null;
    fecha_carga: string;
    hora_carga?: string | null;
    estado?: string;
    observaciones?: string | null;
}

export type UpdateOperacionCargaDTO = Partial<CreateOperacionCargaDTO>;