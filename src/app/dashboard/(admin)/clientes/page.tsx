import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import ClientesTable from '@/components/clientes/ClientesTable';

export default function ClientesTestPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle=" Gestion de Clientes" />
            <div className="space-y-6">
                <ComponentCard title="Listado de clientes desde backend">
                    <ClientesTable />
                </ComponentCard>
            </div>
        </div>
    );
}