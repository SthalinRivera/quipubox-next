export interface Variedad {
    id_variedad: number;
    nombre: string;
    fruta_id: number;
    estado: boolean;
    frutas?: { id_fruta: number; nombre: string };  // 👈 añade esta línea
}