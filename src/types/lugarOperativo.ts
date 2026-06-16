export interface LugarOperativo {
    id_lugar: number;
    id_empresa: number;
    id_sede: number;
    nombre: string;
    direccion_referencia?: string | null;   // ✅ permitir null
    observaciones?: string | null;
    estado: boolean;
    tipo_lugar: string; // o TipoLugar
    created_at: string;
    empresas?: { id_empresa: number; razon_social: string };
    sedes?: { id_sede: number; nombre: string };
}