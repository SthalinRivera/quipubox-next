import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import RolesTable from '@/components/roles/RolesTable';

export default function RolesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Roles de Usuario" />
            <div className="space-y-6">
                <ComponentCard title="Listado de roles">
                    <RolesTable />
                </ComponentCard>
            </div>
        </div>
    );
}