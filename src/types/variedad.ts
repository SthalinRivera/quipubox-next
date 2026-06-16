export interface Variedad {
    id_variedad: number;
    nombre: string;
    estado: boolean;
    id_fruta?: number;      // ← Usar este nombre
    id_empresa?: number;
    frutas?: { id_fruta: number; nombre: string };
    empresas?: { id_empresa: number; razon_social: string };
}