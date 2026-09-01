// components/guias-operativas/GuiaPDF.tsx — Estilo Boleta de Venta
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer';

const W = 226; // ancho tipo boleta (~80mm)
const P = 16;  // padding interno

const styles = StyleSheet.create({
    page: {
        width: W,
        padding: P,
        fontSize: 7,
        fontFamily: 'Courier',
    },
    center: { textAlign: 'center' },
    bold: { fontWeight: 'bold' },
    separator: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
        borderBottomStyle: 'dashed',
        marginVertical: 4,
    },
    separatorSolid: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        marginVertical: 3,
    },
    // --- HEADER ---
    empresa: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    empresaSub: {
        fontSize: 6,
        textAlign: 'center',
        marginTop: 1,
    },
    ruc: {
        fontSize: 7,
        textAlign: 'center',
        marginTop: 1,
    },
    guiaTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
    },
    fecha: {
        fontSize: 6,
        textAlign: 'center',
        marginTop: 1,
    },
    estado: {
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 2,
    },
    // --- FIELDS ---
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    fieldLabel: {
        fontSize: 6,
        width: '45%',
    },
    fieldValue: {
        fontSize: 6,
        fontWeight: 'bold',
        width: '55%',
        textAlign: 'right',
    },
    // --- SECTION TITLE ---
    sectionTitle: {
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 2,
    },
    // --- TABLE ---
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
        paddingVertical: 1,
    },
    col1: { width: '30%', fontSize: 6, fontWeight: 'bold' },
    col2: { width: '12%', fontSize: 6, textAlign: 'center' },
    col3: { width: '30%', fontSize: 5 },
    col4: { width: '14%', fontSize: 6, textAlign: 'right' },
    col5: { width: '14%', fontSize: 6, textAlign: 'right' },
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        paddingTop: 1,
        marginTop: 1,
    },
    totalLabel: { width: '30%', fontSize: 7, fontWeight: 'bold' },
    totalCant: { width: '12%', fontSize: 7, fontWeight: 'bold', textAlign: 'center' },
    totalMonto: { width: '14%', fontSize: 7, fontWeight: 'bold', textAlign: 'right' },
    // --- FIRMA ---
    firma: {
        marginTop: 14,
        alignItems: 'center',
    },
    firmaLine: {
        borderTopWidth: 0.5,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        width: 100,
        paddingTop: 2,
        fontSize: 6,
        textAlign: 'center',
    },
    // --- FOOTER ---
    footer: {
        marginTop: 6,
        borderTopWidth: 0.5,
        borderTopColor: '#000',
        borderTopStyle: 'dashed',
        paddingTop: 3,
        fontSize: 5,
        textAlign: 'center',
    },
});

const Line = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{children}</Text>
    </View>
);

const Field = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}:</Text>
        <Text style={styles.fieldValue}>{value}</Text>
    </View>
);

const DashSep = () => <View style={styles.separator} />;
const SolidSep = () => <View style={styles.separatorSolid} />;

export const GuiaPDF = ({ guia, empresa }: any) => {
    const itemReparto = guia.items_reparto;
    const detalleCarga = itemReparto?.detalle_carga;
    const operacion = detalleCarga?.operaciones_carga;
    const todasCalidades = itemReparto?._todas_las_calidades || [];
    const itemsDelPuesto = itemReparto?._items_del_puesto || [];
    const clienteReceptor = itemReparto?.clientes;

    // Calidades
    const calidadesMap: Record<string, any> = {};
    todasCalidades.forEach((det: any) => {
        const nombre = det.detalle_carga_calidades?.calidades?.nombre || 'S/N';
        if (!calidadesMap[nombre]) {
            calidadesMap[nombre] = { nombre, cantidad_total: 0, items: [], precio_unitario: det.precio_unitario };
        }
        calidadesMap[nombre].cantidad_total += det.cantidad;
        calidadesMap[nombre].items.push({ item_id: det.item_id || det.id_item_reparto, cantidad: det.cantidad });
        if (det.precio_unitario) calidadesMap[nombre].precio_unitario = det.precio_unitario;
    });
    const calidadesResumen = Object.values(calidadesMap);
    const totalGeneral = todasCalidades.reduce((s: number, d: any) => s + (d.precio_unitario ? d.cantidad * d.precio_unitario : 0), 0);
    const cantidadTotal = calidadesResumen.reduce((s: number, c: any) => s + c.cantidad_total, 0);

    // Entrega
    const tieneEntrega = guia.entregas && guia.entregas.length > 0;
    const ultimaEntrega = tieneEntrega ? guia.entregas[0] : null;
    const totalEntregado = guia.entregas?.reduce((s: number, e: any) => s + e.cantidad_entregada, 0) || 0;
    const totalRechazado = guia.entregas?.reduce((s: number, e: any) => s + (e.cantidad_rechazada || 0), 0) || 0;
    const totalAsignado = itemReparto?.cantidad_asignada || 0;
    const porcentaje = totalAsignado > 0 ? Math.min(100, Math.round((totalEntregado / totalAsignado) * 100)) : 0;

    // Fechas
    const fechaEmision = new Date(guia.fecha_emision).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fechaCarga = operacion?.fecha_carga ? new Date(operacion.fecha_carga).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    const formatHora = (h: any): string => {
        if (!h) return '—';
        if (typeof h === 'string') {
            if (h.includes('T')) return h.split('T')[1]?.slice(0, 5) || '—';
            return h.slice(0, 5);
        }
        return '—';
    };
    const horaCarga = formatHora(operacion?.hora_carga);

    // Detalle
    const fruta = detalleCarga?.frutas?.nombre || '—';
    const variedad = detalleCarga?.variedades?.nombre || '—';
    const tipoJaba = detalleCarga?.tipos_jaba?.nombre || '—';
    const materialJaba = detalleCarga?.tipos_jaba?.tipo_material || '—';
    const requiereRetorno = detalleCarga?.requiere_retorno_jabas;
    const clienteEmisor = detalleCarga?.clientes?.nombres ? `${detalleCarga.clientes.nombres} ${detalleCarga.clientes.apellidos || ''}` : '—';
    const clienteEmisorTelefono = detalleCarga?.clientes?.telefono || '—';
    const cantidadJabas = detalleCarga?.cantidad_jabas || 0;
    const instruccion = detalleCarga?.instruccion_reparto || '—';
    const observacionesDetalle = detalleCarga?.observaciones || '—';
    const observacionesGuia = guia.observaciones || '—';

    return (
        <Document>
            <Page size={[W, 842]} style={styles.page}>
                {/* ======= HEADER ======= */}
                <Text style={styles.empresa}>{empresa?.razon_social || 'EMPRESA'}</Text>
                <Text style={styles.empresaSub}>{empresa?.direccion || '—'}</Text>
                <Text style={styles.ruc}>RUC: {empresa?.ruc || '—'}</Text>

                <DashSep />

                <Text style={styles.guiaTitle}>GUIA DE REMISION</Text>
                <Text style={[styles.guiaTitle, { fontSize: 12 }]}>N° {guia.numero_guia}</Text>
                <Text style={styles.fecha}>Fecha emisión: {fechaEmision}</Text>
                <Text style={styles.estado}>[ {guia.estado.toUpperCase()} ]</Text>
                {porcentaje > 0 && (
                    <Text style={styles.fecha}>{porcentaje}% ENTREGADO ({totalEntregado}/{totalAsignado})</Text>
                )}

                <DashSep />

                {/* ======= CLIENTE RECEPTOR ======= */}
                <Text style={styles.sectionTitle}>CLIENTE RECEPTOR</Text>
                <Field label="Nombre" value={`${clienteReceptor?.nombres || '—'} ${clienteReceptor?.apellidos || ''}`} />
                {clienteReceptor?.apodo && <Field label="Apodo" value={clienteReceptor.apodo} />}
                {clienteReceptor?.telefono && <Field label="Telefono" value={clienteReceptor.telefono} />}
                <Field label="Puesto" value={`${itemReparto?.puestos?.numero_puesto || '—'} — ${itemReparto?.puestos?.lugares_operativos?.nombre || '—'}`} />

                <SolidSep />

                {/* ======= DATOS GENERALES ======= */}
                <Text style={styles.sectionTitle}>DATOS GENERALES</Text>
                <Field label="Repartidor" value={guia.usuarios?.nombres || '—'} />
                <Field label="Operacion" value={`#${operacion?.id_operacion || '—'}`} />
                <Field label="Camion" value={operacion?.camiones?.placa || '—'} />
                <Field label="Origen" value={operacion?.sedes_operaciones_carga_id_sede_origenTosedes?.nombre || '—'} />
                <Field label="Destino" value={operacion?.sedes_operaciones_carga_id_sede_destinoTosedes?.nombre || '—'} />
                <Field label="Fecha carga" value={`${fechaCarga} ${horaCarga}`} />
                <Field label="Items" value={`${itemsDelPuesto.length} asignados`} />
                <Field label="Entregado" value={`${totalEntregado} / Rechazado: ${totalRechazado}`} />

                <SolidSep />

                {/* ======= DETALLE CARGA ======= */}
                <Text style={styles.sectionTitle}>DETALLE DE CARGA</Text>
                <Field label="Fruta" value={fruta} />
                <Field label="Variedad" value={variedad} />
                <Field label="Jaba" value={`${tipoJaba} (${materialJaba})`} />
                <Field label="Retornable" value={requiereRetorno ? 'Si' : 'No'} />
                <Field label="Cant. jabas" value={`${cantidadJabas}`} />
                <Field label="Emisor" value={clienteEmisor} />
                <Field label="Tel. emisor" value={clienteEmisorTelefono} />
                {instruccion !== '—' && <Field label="Instruccion" value={instruccion} />}
                {observacionesDetalle !== '—' && <Field label="Obs. detalle" value={observacionesDetalle} />}
                {observacionesGuia !== '—' && <Field label="Obs. guia" value={observacionesGuia} />}

                <SolidSep />

                {/* ======= CALIDADES ======= */}
                <Text style={styles.sectionTitle}>CALIDADES</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>CALIDAD</Text>
                    <Text style={styles.col2}>CANT</Text>
                    <Text style={styles.col3}>ITEMS</Text>
                    <Text style={styles.col4}>PRECIO</Text>
                    <Text style={styles.col5}>SUBT</Text>
                </View>
                {calidadesResumen.map((cal: any) => {
                    const sub = cal.precio_unitario ? cal.cantidad_total * cal.precio_unitario : 0;
                    const items = cal.items.map((it: any) => `#${it.item_id}`).join(' ');
                    return (
                        <View key={cal.nombre} style={styles.tableRow}>
                            <Text style={styles.col1}>{cal.nombre}</Text>
                            <Text style={styles.col2}>{cal.cantidad_total}</Text>
                            <Text style={styles.col3}>{items}</Text>
                            <Text style={styles.col4}>{cal.precio_unitario ? `S/${cal.precio_unitario}` : '—'}</Text>
                            <Text style={styles.col5}>{sub > 0 ? `S/${sub.toFixed(2)}` : '—'}</Text>
                        </View>
                    );
                })}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL</Text>
                    <Text style={styles.totalCant}>{cantidadTotal}</Text>
                    <Text style={styles.totalMonto}>{totalGeneral > 0 ? `S/ ${totalGeneral.toFixed(2)}` : '—'}</Text>
                </View>

                <DashSep />

                {/* ======= ENTREGA ======= */}
                <Text style={styles.sectionTitle}>ESTADO DE ENTREGA</Text>
                <Field label="Estado" value={tieneEntrega ? 'ENTREGADA' : 'PENDIENTE'} />
                {tieneEntrega ? (
                    <>
                        <Field label="Fecha" value={`${new Date(ultimaEntrega.fecha_entrega).toLocaleDateString('es-PE')} ${ultimaEntrega.hora_entrega ? ultimaEntrega.hora_entrega.slice(0, 5) : ''}`} />
                        <Field label="Recibio" value={ultimaEntrega.nombre_recibe || '—'} />
                        {ultimaEntrega.usuarios?.nombres && <Field label="Entrego" value={ultimaEntrega.usuarios.nombres} />}
                    </>
                ) : null}

                <DashSep />

                {/* ======= FIRMA ======= */}
                <View style={styles.firma}>
                    <View style={styles.firmaLine}>
                        <Text>Firma / Sello</Text>
                    </View>
                </View>

                {/* ======= FOOTER ======= */}
                <View style={styles.footer}>
                    <Text>--- DOCUMENTO GENERADO ELECTRONICAMENTE ---</Text>
                    <Text>{new Date().toLocaleDateString('es-PE')} {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </Page>
        </Document>
    );
};
