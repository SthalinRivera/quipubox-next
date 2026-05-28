import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CalidadesTable from "@/components/calidades/CalidadesTable";

export default function CalidadesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Calidades" />
            <div className="space-y-6">
                <ComponentCard title="Listado de calidades">
                    <CalidadesTable />
                </ComponentCard>
            </div>
        </div>
    );
}