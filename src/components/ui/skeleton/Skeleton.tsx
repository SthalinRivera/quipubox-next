// components/ui/skeleton.tsx
import { cn } from "@/lib/utils"; // si no tienes cn, crea una función simple o usa className directamente

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", className)}
            {...props}
        />
    );
}