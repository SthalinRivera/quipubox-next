export interface Cliente {
    id_cliente: number;
    id_empresa: number;
    nombres: string;
    apellidos?: string | null;
    apodo?: string | null;
    telefono?: string | null;
    observaciones?: string | null;
    estado: boolean;
    created_at?: string;
    empresas?: { id_empresa: number; razon_social: string };
    cliente_distrito?: ClienteSede[];
    clientes_puestos?: ClientePuesto[];
}

export interface ClienteSede {
    id_cliente_distrito: number;
    id_cliente: number;
    id_ubigeo: string;
    tipo_relacion: string;
    estado: boolean;
    distritos?: Sede;
}

export interface Sede {
    id_ubigeo: string;
    id_empresa: number;
    nombre: string;
    tipo_sede?: string;
    direccion?: string;
    ciudad?: string;
    departamento?: string;
    estado: boolean;
}

export interface Puesto {
    id_puesto: number;
    id_empresa: number;
    id_lugar: number;
    codigo_puesto: string;
    referencia?: string;
    estado: boolean;
}

export interface ClientePuesto {
    id_cliente_puesto: number;
    id_cliente: number;
    id_puesto: number;
    fecha_inicio: string;
    fecha_fin?: string | null;
    estado: boolean;
    seccion?: string | null;
    puestos?: {
        id_puesto: number;
        codigo_puesto: string;
        lugares_operativos?: {
            id_lugar: number;
            nombre: string;
            tipo_lugar?: string;
            distritos?: { nombre: string };
        };
    };
}
export interface PuestoAsignado {
    id_cliente_puesto: number;
    id_cliente: number;
    id_puesto: number;
    fecha_inicio: string;
    fecha_fin?: string | null;
    estado: boolean;
    seccion?: string | null;
    puestos?: {
        id_puesto: number;
        codigo_puesto: string;
        lugares_operativos?: {
            id_lugar: number;
            nombre: string;
            tipo_lugar?: string;
            distritos?: { nombre: string };
        };
    };
    clientes_puestos?: PuestoAsignado[];
}
