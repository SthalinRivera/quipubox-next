import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import SedesTable from "@/components/sedes/SedesTable";

export default function SedesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Sedes" />
            <div className="space-y-6">
                <ComponentCard title="Listado de sedes">
                    <SedesTable />
                </ComponentCard>
            </div>
        </div>
    );
}