import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import OperacionesCargaTable from "@/components/operaciones-carga/OperacionesCargaTable";

export default function OperacionesCargaPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Operaciones de Carga" />
            <div className="space-y-6">
                <ComponentCard title="Listado de operaciones">
                    <OperacionesCargaTable />
                </ComponentCard>
            </div>
        </div>
    );
}