'use client';

import * as React from 'react';
import { cn } from '@/lib/utils'; // Asegúrate de tener esta utilidad (o crea una simple)

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
    tabClassName?: string;
    activeTabClassName?: string;
    variant?: 'underline' | 'pill' | 'default';
}

export function Tabs({
    tabs,
    activeTab,
    onChange,
    className,
    tabClassName,
    activeTabClassName,
    variant = 'default',
}: TabsProps) {
    return (
        <div className={cn('flex border-b border-gray-200 dark:border-gray-700', className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDisabled = tab.disabled;

                // Estilos base
                let baseStyles =
                    'px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2';
                let activeStyles = '';

                if (variant === 'underline') {
                    baseStyles += ' border-b-2 border-transparent';
                    activeStyles = 'border-brand-500 text-brand-600 dark:text-brand-400';
                } else if (variant === 'pill') {
                    baseStyles += ' rounded-full';
                    activeStyles = 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300';
                } else {
                    // default
                    baseStyles += ' rounded-t-lg';
                    activeStyles = 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white';
                }

                const finalClassName = cn(
                    baseStyles,
                    isActive && activeStyles,
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    !isActive && 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                    tabClassName,
                    isActive && activeTabClassName,
                );

                return (
                    <button
                        key={tab.id}
                        onClick={() => !isDisabled && onChange(tab.id)}
                        disabled={isDisabled}
                        className={finalClassName}
                        aria-selected={isActive}
                        role="tab"
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export default Tabs;