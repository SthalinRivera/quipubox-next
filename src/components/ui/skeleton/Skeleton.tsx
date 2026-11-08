// components/ui/skeleton.tsx
import { cn } from "@/lib/utils"; // si no tienes cn, crea una función simple o usa className directamente

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse motion-reduce:animate-none rounded-md bg-gray-100 dark:bg-gray-800", className)}
            {...props}
        />
    );
}