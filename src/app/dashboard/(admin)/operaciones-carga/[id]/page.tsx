import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import DetallesCargaTable from "@/components/detalle-carga/DetallesCargaTable";


interface Props {
    params: Promise<{ id: string }>; // 👈 En Next.js 15 es Promise
}

export default async function OperacionDetallePage({ params }: Props) {
    const { id } = await params;      // 👈 Resolvemos la promesa
    const operacionId = parseInt(id, 10);

    if (isNaN(operacionId)) {
        return <div className="p-4 text-red-500">ID de operación inválido</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle={`Operación #${operacionId}`} />


            <div className="space-y-6">
                <ComponentCard title="Detalles de carga">
                    <DetallesCargaTable operacionId={operacionId} />
                </ComponentCard>
            </div>
        </div>
    );
}