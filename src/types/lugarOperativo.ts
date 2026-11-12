export interface LugarOperativo {
    id_lugar: number;
    id_empresa: number;
    id_ubigeo: string;
    nombre: string;
    direccion_referencia?: string | null;   // ✅ permitir null
    observaciones?: string | null;
    estado: boolean;
    tipo_lugar: string; // o TipoLugar
    created_at: string;
    empresas?: { id_empresa: number; razon_social: string };
    distritos?: { id_ubigeo: string; nombre: string };
}