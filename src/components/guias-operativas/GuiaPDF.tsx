// components/guias-operativas/GuiaPDF.tsx
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 12,
        fontSize: 7,
        fontFamily: 'Helvetica',
        width: 226,
    },
    header: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingBottom: 4,
        marginBottom: 4,
    },
    empresa: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 1,
    },
    empresaSub: {
        fontSize: 6,
        color: '#444',
        textAlign: 'center',
    },
    guiaNumero: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 2,
    },
    fechaEmision: {
        fontSize: 6,
        color: '#555',
        textAlign: 'center',
        marginTop: 1,
    },
    estado: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#fff',
        paddingHorizontal: 6,
        paddingVertical: 1,
        marginTop: 2,
        textAlign: 'center',
        alignSelf: 'center',
    },
    porcentajeBox: {
        alignItems: 'center',
        marginTop: 2,
        padding: 2,
        backgroundColor: '#d1fae5',
        borderRadius: 2,
    },
    porcentajeNum: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#059669',
    },
    porcentajeLabel: {
        fontSize: 5,
        color: '#059669',
    },
    section: {
        marginBottom: 3,
    },
    sectionTitle: {
        fontSize: 7,
        fontWeight: 'bold',
        marginBottom: 2,
        backgroundColor: '#e5e7eb',
        padding: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    label: {
        fontSize: 6,
        color: '#666',
        width: '38%',
    },
    value: {
        fontSize: 7,
        fontWeight: 'bold',
        width: '62%',
        textAlign: 'right',
    },
    divider: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'solid',
        marginVertical: 3,
    },
    // Clientes receptor con detalles
    clienteBox: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderStyle: 'solid',
        borderRadius: 2,
        padding: 3,
        marginBottom: 3,
    },
    clienteNombre: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    clienteDetail: {
        fontSize: 6,
        color: '#555',
    },
    // Tabla de calidades
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingBottom: 1,
        marginBottom: 1,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        borderBottomStyle: 'solid',
        paddingVertical: 1,
    },
    colCalidad: { width: '22%', fontSize: 7 },
    colCantidad: { width: '13%', fontSize: 7, textAlign: 'center' },
    colItems: { width: '28%', fontSize: 6, color: '#555' },
    colPrecio: { width: '18%', fontSize: 6, textAlign: 'right', color: '#555' },
    colSubtotal: { width: '19%', fontSize: 6, textAlign: 'right' },
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        paddingTop: 1,
        marginTop: 1,
    },
    totalLabel: { width: '22%', fontSize: 7, fontWeight: 'bold' },
    totalCantidad: { width: '13%', fontSize: 7, fontWeight: 'bold', textAlign: 'center' },
    totalMonto: { width: '19%', fontSize: 7, fontWeight: 'bold', textAlign: 'right' },
    // Entrega
    entregaBox: {
        padding: 3,
        marginTop: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 2,
    },
    entregaEntregado: {
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
    },
    entregaPendiente: {
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
    },
    entregaStatus: {
        fontSize: 7,
        fontWeight: 'bold',
    },
    entregaDetail: {
        fontSize: 6,
        color: '#555',
        marginTop: 1,
    },
    firma: {
        marginTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        width: '50%',
        paddingTop: 2,
        fontSize: 6,
        textAlign: 'center',
    },
    footer: {
        marginTop: 6,
        borderTopWidth: 0.5,
        borderTopColor: '#ccc',
        borderTopStyle: 'solid',
        paddingTop: 2,
        fontSize: 5,
        color: '#888',
        textAlign: 'center',
    },
});

export const GuiaPDF = ({ guia, empresa, logoUrl }: any) => {
    const itemReparto = guia.items_reparto;
    const detalleCarga = itemReparto?.detalle_carga;
    const operacion = detalleCarga?.operaciones_carga;
    const clientesAgrupados = itemReparto?._clientes_agrupados || [];
    const todasCalidades = itemReparto?._todas_las_calidades || [];
    const itemsDelPuesto = itemReparto?._items_del_puesto || [];

    // Cliente receptor (del item principal)
    const clienteReceptor = itemReparto?.clientes;

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
        calidadesMap[nombre].cantidad_total += det.cantidad;
        calidadesMap[nombre].items.push({
            item_id: det.item_id || det.id_item_reparto,
            cantidad: det.cantidad,
        });
        if (det.precio_unitario) calidadesMap[nombre].precio_unitario = det.precio_unitario;
    });
    const calidadesResumen = Object.values(calidadesMap);
    const totalGeneral = todasCalidades.reduce(
        (sum: number, d: any) => sum + (d.precio_unitario ? d.cantidad * d.precio_unitario : 0),
        0,
    );
    const cantidadTotal = calidadesResumen.reduce((sum: number, c: any) => sum + c.cantidad_total, 0);

    // Entrega
    const tieneEntrega = guia.entregas && guia.entregas.length > 0;
    const ultimaEntrega = tieneEntrega ? guia.entregas[0] : null;

    // Entregado / Rechazado
    const totalEntregado = guia.entregas?.reduce((sum: number, e: any) => sum + e.cantidad_entregada, 0) || 0;
    const totalRechazado = guia.entregas?.reduce((sum: number, e: any) => sum + (e.cantidad_rechazada || 0), 0) || 0;
    const totalAsignado = itemReparto?.cantidad_asignada || 0;
    const porcentaje = totalAsignado > 0 ? Math.min(100, Math.round((totalEntregado / totalAsignado) * 100)) : 0;

    // Fechas
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
    const formatHora = (hora: any): string => {
        if (!hora) return '—';
        if (typeof hora === 'string') {
            if (hora.includes('T')) return hora.split('T')[1]?.slice(0, 5) || '—';
            if (/^\d{4}-/.test(hora)) return hora.split(' ')[1]?.slice(0, 5) || '—';
            return hora.slice(0, 5);
        }
        return '—';
    };
    const horaCarga = formatHora(operacion?.hora_carga);

    // Datos del detalle de carga
    const fruta = detalleCarga?.frutas?.nombre || '—';
    const variedad = detalleCarga?.variedades?.nombre || '—';
    const tipoJaba = detalleCarga?.tipos_jaba?.nombre || '—';
    const materialJaba = detalleCarga?.tipos_jaba?.tipo_material || '—';
    const requiereRetorno = detalleCarga?.requiere_retorno_jabas;
    const clienteEmisor = detalleCarga?.clientes?.nombres
        ? `${detalleCarga.clientes.nombres} ${detalleCarga.clientes.apellidos || ''}`
        : '—';
    const clienteEmisorTelefono = detalleCarga?.clientes?.telefono || '—';
    const cantidadJabas = detalleCarga?.cantidad_jabas || 0;
    const instruccion = detalleCarga?.instruccion_reparto || '—';
    const observacionesDetalle = detalleCarga?.observaciones || '—';
    const observacionesGuia = guia.observaciones || '—';

    return (
        <Document>
            <Page size={[226, 550]} style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.empresa}>{empresa?.razon_social || 'Empresa'}</Text>
                    <Text style={styles.empresaSub}>RUC: {empresa?.ruc || '---'} | {empresa?.direccion || '---'}</Text>
                    <Text style={styles.guiaNumero}>GUÍA #{guia.numero_guia}</Text>
                    <Text style={styles.fechaEmision}>Emisión: {fechaEmision}</Text>
                    <Text style={[styles.estado, { backgroundColor: guia.estado === 'firmada' ? '#10b981' : '#f59e0b' }]}>
                        {guia.estado.toUpperCase()}
                    </Text>
                    {porcentaje > 0 && (
                        <View style={styles.porcentajeBox}>
                            <Text style={styles.porcentajeNum}>{porcentaje}%</Text>
                            <Text style={styles.porcentajeLabel}>entregado</Text>
                        </View>
                    )}
                </View>

                {/* CLIENTE RECEPTOR */}
                <View style={styles.clienteBox}>
                    <Text style={styles.clienteNombre}> CLIENTE RECEPTOR</Text>
                    <Text style={styles.clienteDetail}>Nombre: {clienteReceptor?.nombres || '—'} {clienteReceptor?.apellidos || ''}</Text>
                    {clienteReceptor?.apodo && <Text style={styles.clienteDetail}>Apodo: {clienteReceptor.apodo}</Text>}
                    {clienteReceptor?.telefono && <Text style={styles.clienteDetail}>Teléfono: {clienteReceptor.telefono}</Text>}
                    <Text style={styles.clienteDetail}>Puesto: {itemReparto?.puestos?.numero_puesto || '—'} ({itemReparto?.puestos?.lugares_operativos?.nombre || '—'})</Text>
                </View>

                {/* DATOS GENERALES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DATOS GENERALES</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Repartidor:</Text>
                        <Text style={styles.value}>{guia.usuarios?.nombres || '—'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Empresa:</Text>
                        <Text style={styles.value}>{empresa?.razon_social || '—'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Operación:</Text>
                        <Text style={styles.value}>#{operacion?.id_operacion || '—'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Camión:</Text>
                        <Text style={styles.value}>{operacion?.camiones?.placa || '—'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Sede origen:</Text>
                        <Text style={styles.value}>{operacion?.sedes_operaciones_carga_id_sede_origenTosedes?.nombre || '—'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Sede destino:</Text>
                        <Text style={styles.value}>{operacion?.sedes_operaciones_carga_id_sede_destinoTosedes?.nombre || '—'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha de carga:</Text>
                        <Text style={styles.value}>{fechaCarga}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Hora de carga:</Text>
                        <Text style={styles.value}>{horaCarga}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Items asignados:</Text>
                        <Text style={styles.value}>{itemsDelPuesto.length}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Entregado / Rechazado:</Text>
                        <Text style={styles.value}>{totalEntregado} / {totalRechazado}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* DETALLE DE LA CARGA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DETALLE DE LA CARGA</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fruta:</Text>
                        <Text style={styles.value}>{fruta}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Variedad:</Text>
                        <Text style={styles.value}>{variedad}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tipo de jaba:</Text>
                        <Text style={styles.value}>{tipoJaba} ({materialJaba})</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Jabas retornables:</Text>
                        <Text style={styles.value}>{requiereRetorno ? 'Sí' : 'No'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cantidad de jabas:</Text>
                        <Text style={styles.value}>{cantidadJabas}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cliente emisor:</Text>
                        <Text style={styles.value}>{clienteEmisor}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tel. emisor:</Text>
                        <Text style={styles.value}>{clienteEmisorTelefono}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Instrucción:</Text>
                        <Text style={styles.value}>{instruccion}</Text>
                    </View>
                    {observacionesDetalle !== '—' && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Observ. detalle:</Text>
                            <Text style={styles.value}>{observacionesDetalle}</Text>
                        </View>
                    )}
                    {observacionesGuia !== '—' && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Observ. guía:</Text>
                            <Text style={styles.value}>{observacionesGuia}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.divider} />

                {/* CALIDADES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CALIDADES — PUESTO {itemReparto?.puestos?.numero_puesto || '—'} ({itemsDelPuesto.length} items)</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colCalidad}>Calidad</Text>
                        <Text style={styles.colCantidad}>Cant.</Text>
                        <Text style={styles.colItems}>Items</Text>
                        <Text style={styles.colPrecio}>Precio</Text>
                        <Text style={styles.colSubtotal}>Subtotal</Text>
                    </View>
                    {calidadesResumen.map((cal: any) => {
                        const subtotal = cal.precio_unitario ? cal.cantidad_total * cal.precio_unitario : 0;
                        const itemsText = cal.items.map((it: any) => `#${it.item_id}(${it.cantidad})`).join(', ');
                        return (
                            <View key={cal.nombre} style={styles.tableRow}>
                                <Text style={styles.colCalidad}>{cal.nombre}</Text>
                                <Text style={styles.colCantidad}>{cal.cantidad_total}</Text>
                                <Text style={styles.colItems}>{itemsText}</Text>
                                <Text style={styles.colPrecio}>
                                    {cal.precio_unitario ? `S/ ${cal.precio_unitario}` : '—'}
                                </Text>
                                <Text style={styles.colSubtotal}>
                                    {subtotal > 0 ? `S/ ${subtotal.toFixed(2)}` : '—'}
                                </Text>
                            </View>
                        );
                    })}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <Text style={styles.totalCantidad}>{cantidadTotal}</Text>
                        <Text style={styles.totalMonto}>
                            {totalGeneral > 0 ? `S/ ${totalGeneral.toFixed(2)}` : '—'}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* ENTREGA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ESTADO DE ENTREGA</Text>
                    <View style={[styles.entregaBox, tieneEntrega ? styles.entregaEntregado : styles.entregaPendiente]}>
                        <Text style={styles.entregaStatus}>
                            {tieneEntrega ? '✓ ENTREGADA' : '⏳ PENDIENTE'}
                        </Text>
                        {tieneEntrega ? (
                            <>
                                <Text style={styles.entregaDetail}>
                                    Fecha: {new Date(ultimaEntrega.fecha_entrega).toLocaleDateString('es-PE')}
                                    {ultimaEntrega.hora_entrega && ` — ${ultimaEntrega.hora_entrega.slice(0, 5)}`}
                                </Text>
                                <Text style={styles.entregaDetail}>
                                    Recibió: {ultimaEntrega.nombre_recibe || '—'}
                                </Text>
                                {ultimaEntrega.usuarios?.nombres && (
                                    <Text style={styles.entregaDetail}>
                                        Entregó: {ultimaEntrega.usuarios.nombres}
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Text style={styles.entregaDetail}>Esta guía aún no ha sido entregada</Text>
                        )}
                    </View>
                </View>

                {/* FIRMA */}
                <View style={styles.firma}>
                    <Text>Firma de recibido</Text>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text>Documento generado electrónicamente</Text>
                    <Text>{new Date().toLocaleDateString('es-PE')} {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </Page>
        </Document>
    );
};
