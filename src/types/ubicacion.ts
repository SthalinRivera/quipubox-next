export interface Ubicacion {
  id_ubigeo: string;
  id_provincia: string;
  nombre: string;
  provincias?: { id_provincia: string; nombre: string; departamentos?: { id_departamento: string; nombre: string } };
}
