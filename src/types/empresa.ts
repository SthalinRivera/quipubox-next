export interface Empresa {
    id_empresa: number;
    razon_social: string;
    nombre_comercial: string;
    ruc?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    estado: boolean;
    created_at?: string;
}