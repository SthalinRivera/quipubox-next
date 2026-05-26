import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    className?: string;
    containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', containerClassName = '', ...props }, ref) => {
        return (
            <div className={`mb-4 ${containerClassName}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
            focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-400
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;