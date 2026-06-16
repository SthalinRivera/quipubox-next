// components/ui/Stepper.tsx (mejorado)
'use client';
import { useRouter } from 'next/navigation';
import { useCreacionCargaStore } from '@/stores/creacionCargaStore';

export function Stepper() {
    const router = useRouter();
    const {
        paso1Completado,
        paso2Completado,
        currentStep,
        setCurrentStep,
        operacionId,
    } = useCreacionCargaStore();

    const steps = [
        { id: 'operacion', label: 'Operación', path: '/dashboard/operaciones-carga/nueva', completed: paso1Completado },
        { id: 'detalles', label: 'Detalles', path: operacionId ? `/dashboard/operaciones-carga/${operacionId}` : null, completed: paso2Completado },
        { id: 'guias', label: 'Guías', path: null, completed: false }, // aún no implementado
    ];

    const handleStepClick = (idx: number) => {
        const step = steps[idx];
        if (!step.completed && idx > currentStep - 1) return; // no puede saltar hacia adelante si no está completado
        if (step.path) {
            setCurrentStep((idx + 1) as 1 | 2 | 3);
            router.push(step.path);
        }
    };

    return (
        <div className="w-full mb-6 px-4">
            <div className="flex items-center">
                {steps.map((step, idx) => {
                    const isActive = idx + 1 === currentStep;
                    const isCompleted = step.completed;
                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-all ${isCompleted || isActive ? 'opacity-100' : 'opacity-60'}`}
                                onClick={() => handleStepClick(idx)}
                            >
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-brand-500 text-white ring-4 ring-brand-200 dark:ring-brand-800' :
                                            'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
                `}>
                                    {isCompleted ? '✓' : idx + 1}
                                </div>
                                <span className="mt-1 text-xs text-center text-gray-600 dark:text-gray-400 max-w-[80px]">
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}