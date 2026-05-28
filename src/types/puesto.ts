export interface Puesto {
  id_puesto: number;
  id_empresa: number;
  id_lugar: number;
  numero_puesto: string;
  referencia?: string | null;
  estado: boolean;
  created_at?: string;
  empresas?: { id_empresa: number; razon_social: string };
  lugares_operativos?: { id_lugar: number; nombre: string };
}