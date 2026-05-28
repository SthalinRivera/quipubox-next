import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import MercadosTable from '@/components/mercados/MercadosTable';

export default function MercadosPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Mercados" />
            <div className="space-y-6">
                <ComponentCard title="Listado de mercados">
                    <MercadosTable />
                </ComponentCard>
            </div>
        </div>
    );
}