export interface ClientePuesto {
    id_cliente_puesto: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: boolean;
    seccion: string | null;
    clientes: {
        id_cliente: number;
        nombres: string;
        apellidos: string;
        telefono: string;
    };
    puestos: {
        id_puesto: number;
        numero_puesto: string;
        lugares_operativos: {
            nombre: string; // mercado
            sedes: { nombre: string } | null;
        };
    };
}