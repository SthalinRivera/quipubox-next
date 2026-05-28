export interface TipoJaba {
    id_tipo_jaba: number;
    id_empresa: number;
    nombre: string;
    tipo_material?: string | null;
    descripcion?: string | null;
    estado: boolean;
    created_at?: string;
    empresas?: { id_empresa: number; razon_social: string };
}