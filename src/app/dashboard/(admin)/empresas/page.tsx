import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import EmpresasTable from "@/components/empresas/EmpresasTable";

export default function EmpresasPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Empresas" />
            <div className="space-y-6">
                <ComponentCard title="Listado de empresas">
                    <EmpresasTable />
                </ComponentCard>
            </div>
        </div>
    );
}