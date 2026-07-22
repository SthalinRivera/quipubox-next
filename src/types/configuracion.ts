export interface Categoria {
    id_categoria: number;
    nombre: string;
    descripcion?: string | null;
    icono_web?: string | null;
    icono_mobil?: string | null;
    orden?: number | null;
    estado: boolean;
    created_at?: string;
    updated_at?: string;
    modulos?: Modulo[];
}

export interface Modulo {
    id_modulo: number;
    nombre: string;
    ruta: string;
    id_categoria: number;
    orden?: number | null;
    estado: boolean;
    created_at?: string;
    updated_at?: string;
    categorias?: Categoria;
}

export interface RolModulo {
    id_rol_modulo: number;
    rol_id: number;
    modulo_id: number;
    fecha_asignacion?: string;
    usuario_asigno?: number | null;
}

export interface ModuloAsignado {
    id_rol_modulo: number;
    modulo: {
        id_modulo: number;
        nombre: string;
        ruta: string;
        orden: number | null;
        estado: boolean;
        categoria: {
            id_categoria: number;
            nombre: string;
        };
    };
    fecha_asignacion?: string;
}

export interface ModuloPermitido {
    id_modulo: number;
    nombre: string;
    ruta: string;
    orden: number | null;
    estado: boolean;
    categoria: {
        id_categoria: number;
        nombre: string;
        icono_web?: string | null;
        icono_mobil?: string | null;
        orden: number | null;
    };
}
