export interface DestinoDisponible {
  id_cliente: number;
  id_puesto: number;
  seccion: string | null;
  puestos: { id_puesto: number; codigo_puesto: string; lugares_operativos?: { nombre: string } | null };
}
export function seleccionarDestino(destinos: DestinoDisponible[], cliente?: number | null, puesto?: number | null, seccion?: string | null) {
  const relaciones = destinos.filter(d => d.id_cliente === cliente);
  const puestos = [...new Map(relaciones.map(d => [d.id_puesto, d.puestos])).values()];
  const idPuesto = puestos.some(p => p.id_puesto === puesto) ? puesto! : puestos.length === 1 ? puestos[0].id_puesto : null;
  const secciones = [...new Set(relaciones.filter(d => d.id_puesto === idPuesto).map(d => d.seccion).filter((s): s is string => !!s))];
  const idSeccion = secciones.includes(seccion || '') ? seccion! : secciones.length === 1 ? secciones[0] : null;
  return { puestos, secciones: secciones.map(s => ({ id_seccion: s, nombre_seccion: s })), idPuesto, idSeccion };
}
