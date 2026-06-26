"use client";

import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-900 text-gray-900 font-outfit">
      {/* Sidebar Skeleton (Visible on lg/xl screens) */}
      <aside className="fixed top-0 left-0 z-50 flex flex-col h-screen p-5 border-r border-gray-200 lg:flex w-[290px] bg-white dark:bg-gray-950 dark:border-gray-800 hidden lg:translate-x-0">
        {/* Logo Placeholder */}
        <div className="py-8 flex items-center justify-start">
          <div className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        
        {/* Navigation Groups */}
        <div className="flex flex-col gap-6 overflow-y-auto mt-2 no-scrollbar">
          {/* Principal Group */}
          <div>
            <div className="h-3 w-16 mb-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <ul className="flex flex-col gap-4">
              {[...Array(6)].map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                </li>
              ))}
            </ul>
          </div>

          {/* Otros Group */}
          <div>
            <div className="h-3 w-16 mb-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <ul className="flex flex-col gap-4">
              {[...Array(2)].map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 lg:ml-[290px] transition-all duration-300">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 flex w-full h-16 bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800 lg:px-6">
          <div className="flex items-center justify-between w-full px-4 py-4 lg:py-4">
            {/* Left side: Hamburger (Mobile) and Search (Desktop) */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-800 animate-pulse lg:hidden" />
              <div className="hidden h-10 w-[300px] xl:w-[430px] rounded-lg bg-gray-100 dark:bg-gray-800/50 animate-pulse lg:block" />
            </div>
            {/* Right side: Icons and User Profile */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-250 dark:bg-gray-800 animate-pulse" />
                <div className="hidden sm:block">
                  <div className="h-3 w-20 mb-1.5 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="h-2 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 space-y-6">
          {/* Header Title placeholder */}
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-2" />
              <div className="h-3.5 w-72 rounded bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
            </div>
            <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>

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
