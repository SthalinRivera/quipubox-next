import { Entrega } from "./entrega";
import { ItemReparto } from "./itemReparto";

export interface GuiaOperativa {
    id_guia: number;
    id_empresa: number;
    numero_guia: string;
    fecha_emision: string;
    id_repartidor?: number | null;
    estado: string;
    observaciones?: string | null;
    created_at: string;
    id_item_reparto: number;
    usuarios?: { id_usuario: number; nombres: string; apellidos?: string };
    items_reparto?: ItemReparto;
    entregas?: Entrega[];
}

export interface CreateGuiaOperativaDto {
    numero_guia: string;
    fecha_emision: string;
    id_repartidor?: number | null;
    observaciones?: string | null;
    id_item_reparto: number;
    estado?: string;
}