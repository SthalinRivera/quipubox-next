/** Usa la copia emitida; las relaciones actuales no son evidencia histórica. */
export function guiaDocumento(guia: any): any {
  const documento = guia.cobertura?.documento;
  if (!documento) return guia;
  return { ...guia, items_reparto: documento.item, empresas: documento.empresa, usuarios: documento.repartidor };
}
