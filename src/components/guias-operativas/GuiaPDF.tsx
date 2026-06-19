// components/guias-operativas/GuiaPDF.tsx
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from '@react-pdf/renderer';

Font.register({
    family: 'Helvetica',
    fonts: [{ src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf' }],
});

const styles = StyleSheet.create({
    page: {
        padding: 25,
        fontSize: 8,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        borderBottom: '2px solid #111',
        paddingBottom: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    headerSub: {
        fontSize: 7,
        color: '#444',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    guiaNumero: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    guiaFecha: {
        fontSize: 8,
        color: '#444',
    },
    estado: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#f59e0b',
        padding: '2 8',
        borderRadius: 3,
        marginTop: 2,
    },
    section: {
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 2,
        backgroundColor: '#e5e7eb',
        padding: 2,
        paddingHorizontal: 4,
    },
    grid2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 1,
    },
    gridItem: {
        width: '50%',
        marginBottom: 1,
        paddingRight: 4,
        flexDirection: 'row',
    },
    label: {
        fontWeight: 'bold',
        color: '#4b5563',
        fontSize: 7,
        width: '30%',
    },
    value: {
        fontSize: 8,
        width: '70%',
    },
    table: {
        width: '100%',
        marginTop: 2,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #e5e7eb',
        paddingVertical: 2,
    },
    tableHeader: {
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold',
    },
    tableColCalidad: { flex: 1.5, paddingHorizontal: 2 },
    tableColCantidad: { flex: 1, paddingHorizontal: 2 },
    tableColItems: { flex: 2.5, paddingHorizontal: 2 },
    tableColPrecio: { flex: 1, paddingHorizontal: 2 },
    tableColSubtotal: { flex: 1, paddingHorizontal: 2 },
    entregaBox: {
        flexDirection: 'row',
        padding: 4,
        marginTop: 2,
        borderRadius: 3,
        borderWidth: 1,
    },
    entregaEntregado: {
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
    },
    entregaPendiente: {
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
    },
    entregaIcon: {
        marginRight: 6,
        fontSize: 12,
    },
    entregaText: {
        fontSize: 8,
    },
    footer: {
        marginTop: 12,
        borderTop: '1px solid #ccc',
        paddingTop: 4,
        fontSize: 6,
        color: '#6b7280',
        textAlign: 'center',
    },
});

export const GuiaPDF = ({ guia, empresa, logoUrl }: any) => {
    const itemReparto = guia.items_reparto;
    const detalleCarga = itemReparto?.detalle_carga;
    const operacion = detalleCarga?.operaciones_carga;
    const itemsDelPuesto = itemReparto?._items_del_puesto || [];
    const todasCalidades = itemReparto?._todas_las_calidades || [];
    const clientesAgrupados = itemReparto?._clientes_agrupados || [];

    // Agrupar calidades CON items asociados
    const calidadesMap: Record<string, any> = {};
    todasCalidades.forEach((det: any) => {
        const nombre = det.detalle_carga_calidades?.calidades?.nombre || 'Sin nombre';
        if (!calidadesMap[nombre]) {
            calidadesMap[nombre] = {
                nombre,
                cantidad_total: 0,
                items: [],
                precio_unitario: det.precio_unitario,
            };
        }
        const entry = calidadesMap[nombre];
        entry.cantidad_total += det.cantidad;
        entry.items.push({
            item_id: det.item_id || det.id_item_reparto,
            cantidad: det.cantidad,
        });
        if (det.precio_unitario) entry.precio_unitario = det.precio_unitario;
    });
    const calidadesResumen = Object.values(calidadesMap);
    const totalGeneral = todasCalidades.reduce(
        (sum: number, d: any) => sum + (d.precio_unitario ? d.cantidad * d.precio_unitario : 0),
        0,
    );
    const cantidadTotalItems = calidadesResumen.reduce((sum, c: any) => sum + c.cantidad_total, 0);

    // Estado de entrega
    const tieneEntrega = guia.entregas && guia.entregas.length > 0;
    const ultimaEntrega = tieneEntrega ? guia.entregas[0] : null;

    // Fechas formateadas
    const fechaEmision = new Date(guia.fecha_emision).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const fechaCarga = operacion?.fecha_carga
        ? new Date(operacion.fecha_carga).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : '—';
    const horaCarga = operacion?.hora_carga ? operacion.hora_carga.slice(0, 5) : '—';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image src={logoUrl} style={styles.logo} />
                        <View>
                            <Text style={styles.headerTitle}>{empresa?.razon_social || 'Empresa'}</Text>
                            <Text style={styles.headerSub}>RUC: {empresa?.ruc || '---'} | {empresa?.direccion || '---'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.guiaNumero}>GUÍA #{guia.numero_guia}</Text>
                        <Text style={styles.guiaFecha}>Emisión: {fechaEmision}</Text>
                        <Text style={styles.estado}>{guia.estado.toUpperCase()}</Text>
                    </View>
                </View>

                {/* DATOS GENERALES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DATOS GENERALES</Text>
                    <View style={styles.grid2}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Repartidor:</Text>
                            <Text style={styles.value}>{guia.usuarios?.nombres || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Puesto:</Text>
                            <Text style={styles.value}>{itemReparto?.puestos?.numero_puesto || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Cliente receptor:</Text>
                            <Text style={styles.value}>{clientesAgrupados.join(', ') || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Items asignados:</Text>
                            <Text style={styles.value}>{itemsDelPuesto.length}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Operación:</Text>
                            <Text style={styles.value}>#{operacion?.id_operacion || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Camión:</Text>
                            <Text style={styles.value}>{operacion?.camiones?.placa || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Origen:</Text>
                            <Text style={styles.value}>{operacion?.sedes_operaciones_carga_id_sede_origenTosedes?.nombre || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Destino:</Text>
                            <Text style={styles.value}>{operacion?.sedes_operaciones_carga_id_sede_destinoTosedes?.nombre || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Fecha carga:</Text>
                            <Text style={styles.value}>{fechaCarga}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Hora carga:</Text>
                            <Text style={styles.value}>{horaCarga}</Text>
                        </View>
                    </View>
                </View>

                {/* DETALLE DE LA CARGA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DETALLE DE LA CARGA</Text>
                    <View style={styles.grid2}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Fruta:</Text>
                            <Text style={styles.value}>{detalleCarga?.frutas?.nombre || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Variedad:</Text>
                            <Text style={styles.value}>{detalleCarga?.variedades?.nombre || '—'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Tipo jaba:</Text>
                            <Text style={styles.value}>
                                {detalleCarga?.tipos_jaba?.nombre || '—'} ({detalleCarga?.tipos_jaba?.tipo_material || '—'})
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Jabas retornables:</Text>
                            <Text style={styles.value}>{detalleCarga?.requiere_retorno_jabas ? 'Sí' : 'No'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Cantidad jabas:</Text>
                            <Text style={styles.value}>{detalleCarga?.cantidad_jabas || 0}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Cliente emisor:</Text>
                            <Text style={styles.value}>
                                {detalleCarga?.clientes?.nombres || '—'} {detalleCarga?.clientes?.apellidos || ''}
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Instrucción:</Text>
                            <Text style={styles.value}>{detalleCarga?.instruccion_reparto || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* CALIDADES (TABLA ÚNICA) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        CALIDADES DEL PUESTO {itemsDelPuesto.length > 1 ? `(${itemsDelPuesto.length} items)` : ''}
                    </Text>
                    {calidadesResumen.length > 0 ? (
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableColCalidad]}>Calidad</Text>
                                <Text style={[styles.tableColCantidad]}>Cant.</Text>
                                <Text style={[styles.tableColItems]}>Items asociados</Text>
                                <Text style={[styles.tableColPrecio]}>Precio</Text>
                                <Text style={[styles.tableColSubtotal]}>Subtotal</Text>
                            </View>
                            {calidadesResumen.map((cal: any) => {
                                const subtotal = cal.precio_unitario ? cal.cantidad_total * cal.precio_unitario : 0;
                                const itemsText = cal.items
                                    .map((it: any) => `#${it.item_id}(${it.cantidad})`)
                                    .join(', ');
                                return (
                                    <View key={cal.nombre} style={styles.tableRow}>
                                        <Text style={[styles.tableColCalidad]}>{cal.nombre}</Text>
                                        <Text style={[styles.tableColCantidad]}>{cal.cantidad_total}</Text>
                                        <Text style={[styles.tableColItems]}>{itemsText || '—'}</Text>
                                        <Text style={[styles.tableColPrecio]}>
                                            {cal.precio_unitario ? `S/ ${cal.precio_unitario}` : '—'}
                                        </Text>
                                        <Text style={[styles.tableColSubtotal]}>
                                            {subtotal > 0 ? `S/ ${subtotal.toFixed(2)}` : '—'}
                                        </Text>
                                    </View>
                                );
                            })}
                            {/* ✅ FILA DE TOTAL - SIEMPRE VISIBLE */}
                            <View style={[styles.tableRow, { borderTop: '2px solid #333', fontWeight: 'bold' }]}>
                                <Text style={[styles.tableColCalidad]}>TOTAL</Text>
                                <Text style={[styles.tableColCantidad]}>{cantidadTotalItems}</Text>
                                <Text style={[styles.tableColItems]}></Text>
                                <Text style={[styles.tableColPrecio]}></Text>
                                <Text style={[styles.tableColSubtotal]}>
                                    {totalGeneral > 0 ? `S/ ${totalGeneral.toFixed(2)}` : '—'}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text>No hay calidades registradas</Text>
                    )}
                </View>

                {/* ESTADO DE ENTREGA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ESTADO DE ENTREGA</Text>
                    <View style={[styles.entregaBox, tieneEntrega ? styles.entregaEntregado : styles.entregaPendiente]}>
                        <Text style={styles.entregaIcon}>{tieneEntrega ? '✓' : '⏳'}</Text>
                        <View>
                            {tieneEntrega ? (
                                <>
                                    <Text style={[styles.entregaText, { fontWeight: 'bold' }]}>Entregado</Text>
                                    <Text style={styles.entregaText}>
                                        Fecha: {new Date(ultimaEntrega.fecha_entrega).toLocaleDateString('es-PE')}
                                        {ultimaEntrega.hora_entrega && ` a las ${ultimaEntrega.hora_entrega.slice(0, 5)}`}
                                    </Text>
                                    <Text style={styles.entregaText}>
                                        Recibe: {ultimaEntrega.nombre_recibe || '—'}
                                        {ultimaEntrega.usuarios?.nombres && ` (Entregador: ${ultimaEntrega.usuarios.nombres})`}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.entregaText, { fontWeight: 'bold' }]}>Pendiente de entrega</Text>
                                    <Text style={styles.entregaText}>Esta guía aún no ha sido entregada</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text>Documento generado electrónicamente. Guía de remisión - {new Date().toLocaleDateString('es-PE')}</Text>
                </View>
            </Page>
        </Document>
    );
};