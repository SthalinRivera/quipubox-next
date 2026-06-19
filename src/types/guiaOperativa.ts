import { Entrega } from "./entrega";
import { ItemReparto } from "./itemReparto";


export interface GuiaOperativa {
    id_guia: number;
    numero_guia: string;
    fecha_emision: string;
    id_repartidor?: number | null;
    estado: string;
    observaciones?: string | null;
    created_at: string;
    id_item_reparto: number;

    usuarios?: { id_usuario: number; nombres: string };
    // ✅ Usa ItemReparto, que ya tiene los virtuales
    items_reparto?: ItemReparto;
    entregas?: Array<any>;
    empresas?: {
        id_empresa: number;
        razon_social: string;
        nombre_comercial: string;
        ruc?: string;
        telefono?: string | null;
        direccion?: string | null;
        estado: boolean;
        created_at: string;
    };
}
export interface CreateGuiaOperativaDto {
    numero_guia: string;
    fecha_emision: string;
    id_repartidor?: number | null;
    observaciones?: string | null;
    id_item_reparto: number;
    estado?: string;
}