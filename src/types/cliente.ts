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
    cliente_sede?: ClienteSede[];
    clientes_puestos?: ClientePuesto[];
}

export interface ClienteSede {
    id_cliente_sede: number;
    id_cliente: number;
    id_sede: number;
    tipo_relacion: string;
    estado: boolean;
    sedes?: Sede;
}

export interface Sede {
    id_sede: number;
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
    numero_puesto: string;
    referencia?: string;
    estado: boolean;
}

export interface ClientePuesto {
    id_cliente_puesto: number;
    id_cliente: number;
    id_puesto: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado: boolean;
    puestos?: Puesto;
}