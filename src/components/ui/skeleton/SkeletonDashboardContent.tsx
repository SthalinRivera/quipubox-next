// components/dashboard/SkeletonDashboardContent.tsx
'use client';

export function SkeletonDashboardContent() {
    return (
        <div>
            {/* Main Content Area Skeleton */}
            <div className="flex-1  transition-all duration-300">

                {/* Content Skeleton */}
                <main className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 space-y-6">


                    {/* Metric Cards Grid placeholder */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-950 dark:border-gray-800 space-y-4 shadow-theme-xs">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                </div>
                                <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* Large Section grid layout placeholder */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 xl:col-span-8 p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-[350px] shadow-theme-xs">
                            <div className="h-5 w-40 mb-6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                            <div className="w-full h-4/5 rounded bg-gray-50 dark:bg-gray-900/50 animate-pulse" />
                        </div>
                        <div className="col-span-12 xl:col-span-4 p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-950 dark:border-gray-800 h-[350px] shadow-theme-xs">
                            <div className="h-5 w-32 mb-6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                            <div className="w-full h-4/5 rounded bg-gray-50 dark:bg-gray-900/50 animate-pulse" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}