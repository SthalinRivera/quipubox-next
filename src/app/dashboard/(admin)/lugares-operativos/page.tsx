import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import LugarOperativoTable from '@/components/lugares-operativos/LugarOperativoTable';

export default function MercadosPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Mercados" />
            <div className="space-y-6">
                <ComponentCard title="Listado de mercados">
                    <LugarOperativoTable />
                </ComponentCard>
            </div>
        </div>
    );
}