// components/ui/ConfirmDialog.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info" | "success"; // ✅ soporta success
    icon?: React.ReactNode;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar acción",
    message = "¿Estás seguro de realizar esta acción?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
    icon,
}: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) setLoading(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Incluye la variante success
    const variantColors = {
        danger: {
            button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
            text: "text-red-600",
        },
        warning: {
            button: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
            text: "text-amber-600",
        },
        info: {
            button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
            text: "text-blue-600",
        },
        success: {
            button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
            text: "text-green-600",
        },
    };

    // Fallback a danger si la variante no existe
    const currentVariant = variantColors[variant] || variantColors.danger;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon && <div className={currentVariant.text}>{icon}</div>}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Message */}
                <div className="mt-4">
                    <p className="text-gray-600 dark:text-gray-300">{message}</p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentVariant.button} ${loading ? "cursor-not-allowed opacity-70" : ""
                            }`}
                    >
                        {loading ? "Procesando..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}