'use client';

interface Step {
    id: string;
    label: string;
    isCompleted: boolean;
    isRequired?: boolean;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center">
                {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center flex-1">
                        <div
                            className={`flex flex-col items-center cursor-pointer transition-all ${idx <= currentStep ? 'opacity-100' : 'opacity-60'
                                }`}
                            onClick={() => onStepClick?.(idx)}
                        >
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${idx < currentStep
                                        ? 'bg-green-500 text-white'
                                        : idx === currentStep
                                            ? 'bg-brand-500 text-white ring-4 ring-brand-200 dark:ring-brand-800'
                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                    }
                `}
                            >
                                {idx < currentStep ? '✓' : idx + 1}
                            </div>
                            <span className="mt-1 text-xs text-center text-gray-600 dark:text-gray-400 max-w-[80px]">
                                {step.label}
                                {step.isRequired && !step.isCompleted && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}