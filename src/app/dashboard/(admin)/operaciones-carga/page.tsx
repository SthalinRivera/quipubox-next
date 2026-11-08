import OperacionesCargaTable from "@/components/operaciones-carga/OperacionesCargaTable";

export default function OperacionesCargaPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Cargas</h1>
            <OperacionesCargaTable />
        </div>
    );
}
