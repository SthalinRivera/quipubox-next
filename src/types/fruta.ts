export interface Fruta {
    id_fruta: number;
    id_empresa: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
    empresas?: any;       // opcional, si necesitas la relación
    variedades?: any[];
}