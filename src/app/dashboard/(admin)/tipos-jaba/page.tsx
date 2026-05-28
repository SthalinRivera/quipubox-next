import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import TiposJabaTable from '@/components/tipos-jaba/TiposJabaTable';

export default function TiposJabaPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Tipos de Jaba" />
            <div className="space-y-6">
                <ComponentCard title="Listado de tipos de jaba">
                    <TiposJabaTable />
                </ComponentCard>
            </div>
        </div>
    );
}