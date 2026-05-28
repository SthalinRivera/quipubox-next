import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import UsuariosTable from '@/components/usuarios/UsuariosTable';

export default function UsuariosPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Usuarios" />
            <div className="space-y-6">
                <ComponentCard title="Listado de usuarios">
                    <UsuariosTable />
                </ComponentCard>
            </div>
        </div>
    );
}