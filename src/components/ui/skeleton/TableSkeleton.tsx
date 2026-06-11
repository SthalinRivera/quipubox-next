// components/ui/table-skeleton.tsx
import { Skeleton } from "./Skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
    columns: number;          // número de columnas
    rows?: number;            // filas a mostrar (default: 5)
    showHeader?: boolean;     // mostrar cabecera simulada (default: true)
    showActionButton?: boolean; // mostrar botón de acción superior (default: true)
}

export function TableSkeleton({
    columns,
    rows = 5,
    showHeader = true,
    showActionButton = true,
}: TableSkeletonProps) {
    return (
        <div className="space-y-4">
            {showActionButton && (
                <div className="flex justify-end">
                    <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                        <Table>
                            {showHeader && (
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        {Array.from({ length: columns }).map((_, i) => (
                                            <TableCell key={i} isHeader className="px-5 py-3">
                                                <Skeleton className="h-4 w-20" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                            )}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {Array.from({ length: rows }).map((_, rowIdx) => (
                                    <TableRow key={rowIdx}>
                                        {Array.from({ length: columns }).map((_, colIdx) => (
                                            <TableCell key={colIdx} className="px-5 py-4">
                                                <Skeleton className="h-4 w-full max-w-[120px]" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}