import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDate } from '@/utils/date';

// Estilos profesionales
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        paddingBottom: 10,
    },
    logo: {
        width: 80,
    },
    empresaInfo: {
        textAlign: 'right',
    },
    empresaNombre: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 25,
        color: '#2c3e50',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        padding: 6,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        width: '30%',
        fontWeight: 'bold',
    },
    value: {
        width: '70%',
    },
    table: {
        width: 'auto',
        marginTop: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingVertical: 5,
    },
    tableHeader: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
    },
    tableCol: {
        flex: 1,
        paddingHorizontal: 4,
    },
    tableColCalidad: { flex: 3 },
    tableColCantidad: { flex: 1, textAlign: 'center' },
    tableColPrecio: { flex: 2, textAlign: 'right' },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#888888',
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
        paddingTop: 10,
    },
});
interface Props {
    guia: any; // Tipar con GuiaOperativa si lo prefieres
    empresa: any;
    logoUrl?: string;
}

export const GuiaPDF = ({ guia, empresa, logoUrl }: Props) => {
    const itemReparto = guia.items_reparto;
    const entregas = guia.entregas || [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Encabezado con logo y empresa */}
                <View style={styles.header}>
                    {logoUrl && <Image src={logoUrl} style={styles.logo} />}
                    <View style={styles.empresaInfo}>
                        <Text style={styles.empresaNombre}>{empresa.razon_social || empresa.nombre_comercial}</Text>
                        <Text>RUC: {empresa.ruc || '—'}</Text>
                        {empresa.direccion && <Text>Dirección: {empresa.direccion}</Text>}
                        {empresa.telefono && <Text>Teléfono: {empresa.telefono}</Text>}
                    </View>
                </View>

                {/* Título */}
                <Text style={styles.title}>GUÍA OPERATIVA DE REPARTO</Text>

                {/* Datos de la guía */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información de la Guía</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Número de Guía:</Text>
                        <Text style={styles.value}>{guia.numero_guia}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha Emisión:</Text>
                        <Text style={styles.value}>{formatDate(guia.fecha_emision)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Repartidor:</Text>
                        <Text style={styles.value}>{guia.usuarios?.nombres || guia.id_repartidor || '—'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Estado:</Text>
                        <Text style={styles.value}>{guia.estado}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Observaciones:</Text>
                        <Text style={styles.value}>{guia.observaciones || '—'}</Text>
                    </View>
                </View>

                {/* Item de reparto */}
                {itemReparto && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Detalle del Reparto</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cliente Receptor:</Text>
                            <Text style={styles.value}>{itemReparto.clientes?.nombres || '—'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Puesto:</Text>
                            <Text style={styles.value}>{itemReparto.puestos?.numero_puesto || '—'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Mercado / Sede:</Text>
                            <Text style={styles.value}>
                                {itemReparto.puestos?.lugares_operativos?.nombre || '—'} -
                                Sede: {itemReparto.puestos?.lugares_operativos?.sedes?.nombre || '—'}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Sección:</Text>
                            <Text style={styles.value}>{itemReparto.seccion || '—'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cantidad Asignada:</Text>
                            <Text style={styles.value}>{itemReparto.cantidad_asignada} jabas</Text>
                        </View>
                    </View>
                )}

                {/* Calidades */}
                {itemReparto?.items_reparto_detalle && itemReparto.items_reparto_detalle.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Calidades</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCol, styles.tableColCalidad]}>Calidad</Text>
                                <Text style={[styles.tableCol, styles.tableColCantidad]}>Cantidad</Text>
                                <Text style={[styles.tableCol, styles.tableColPrecio]}>Precio Unit.</Text>
                            </View>
                            {itemReparto.items_reparto_detalle.map((det: any) => (
                                <View key={det.id_item_reparto_detalle} style={styles.tableRow}>
                                    <Text style={[styles.tableCol, styles.tableColCalidad]}>
                                        {det.detalle_carga_calidades?.calidades?.nombre || '—'}
                                    </Text>
                                    <Text style={[styles.tableCol, styles.tableColCantidad]}>{det.cantidad}</Text>
                                    <Text style={[styles.tableCol, styles.tableColPrecio]}>
                                        {det.precio_unitario ? `S/ ${det.precio_unitario.toFixed(2)}` : '—'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Entregas */}
                {entregas.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Entregas Realizadas</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCol, { flex: 2 }]}>Fecha/Hora</Text>
                                <Text style={[styles.tableCol, { flex: 1 }]}>Cant. Entregada</Text>
                                <Text style={[styles.tableCol, { flex: 1 }]}>Cant. Rechazada</Text>
                                <Text style={[styles.tableCol, { flex: 2 }]}>Recibe</Text>
                                <Text style={[styles.tableCol, { flex: 1 }]}>Firma</Text>
                            </View>
                            {entregas.map((entrega: any) => (
                                <View key={entrega.id_entrega} style={styles.tableRow}>
                                    <Text style={[styles.tableCol, { flex: 2 }]}>
                                        {formatDate(entrega.fecha_entrega)} {entrega.hora_entrega?.slice(0, 5) || ''}
                                    </Text>
                                    <Text style={[styles.tableCol, { flex: 1 }]}>{entrega.cantidad_entregada}</Text>
                                    <Text style={[styles.tableCol, { flex: 1 }]}>{entrega.cantidad_rechazada}</Text>
                                    <Text style={[styles.tableCol, { flex: 2 }]}>{entrega.nombre_recibe || '—'}</Text>
                                    <Text style={[styles.tableCol, { flex: 1 }]}>{entrega.firma_recibido ? 'Sí' : 'No'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Pie de página */}
                <View style={styles.footer}>
                    <Text>Documento generado electrónicamente - {new Date().toLocaleString()}</Text>
                </View>
            </Page>
        </Document>
    );
};