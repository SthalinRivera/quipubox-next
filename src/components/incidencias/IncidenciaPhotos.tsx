'use client';

import { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, ImagePlus, X } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import IncidenciaCamera from './IncidenciaCamera';

interface IncidenciaPhotosProps {
    files: File[];
    onChange: (files: File[]) => void;
    disabled?: boolean;
}

function PhotoPreview({ file }: { file: File }) {
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        const preview = URL.createObjectURL(file);
        if (imageRef.current) imageRef.current.src = preview;
        return () => URL.revokeObjectURL(preview);
    }, [file]);

    return (
        // Blob URLs are local previews and cannot use the image optimization service.
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imageRef} alt={file.name} className="h-20 w-full object-cover" />
    );
}

export default function IncidenciaPhotos({ files, onChange, disabled = false }: IncidenciaPhotosProps) {
    const [error, setError] = useState('');
    const [cameraOpen, setCameraOpen] = useState(false);
    const addFiles = (accepted: File[], hasRejected = false) => {
            const next = [...files];
            for (const file of accepted) {
                if (!next.some(existing => existing.name === file.name &&
                    existing.size === file.size && existing.lastModified === file.lastModified)) {
                    next.push(file);
                }
            }
            if (next.length > 10) {
                setError('Puedes adjuntar hasta 10 fotos. Quita alguna antes de agregar más.');
                return;
            }
            setError(hasRejected ? 'Solo se permiten imágenes. Revisa los archivos seleccionados.' : '');
            onChange(next);
        };
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        accept: { 'image/*': [] },
        disabled,
        onDrop: (accepted, rejected) => addFiles(accepted, rejected.length > 0),
    });

    return (
        <section aria-label="Fotos de la incidencia" className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fotos de evidencia</span>
                <span aria-live="polite" className="text-xs text-gray-500">{files.length}/10 fotos</span>
            </div>
            <div
                {...getRootProps({
                    role: 'button',
                    'aria-label': 'Arrastrar fotos o seleccionar imágenes',
                    'aria-disabled': disabled,
                })}
                className={`flex items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 text-center transition focus-visible:outline-2 focus-visible:outline-brand-500 ${disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-500/10'
                } ${isDragReject
                    ? 'border-error-500 bg-error-50 dark:bg-error-500/10'
                    : isDragActive
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40'
                }`}
            >
                <input {...getInputProps()} aria-label="Seleccionar fotos de evidencia" />
                <ImagePlus className="h-7 w-7 shrink-0 text-brand-500" aria-hidden="true" />
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {isDragReject ? 'Arrastra únicamente imágenes' : isDragActive ? 'Suelta las fotos aquí' : 'Arrastra tus fotos aquí'}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        o <span className="font-medium text-brand-500">selecciona archivos</span> · Hasta 10 imágenes
                    </p>
                </div>
            </div>
            {cameraOpen ? (
                <IncidenciaCamera
                    disabled={disabled || files.length >= 10}
                    onClose={() => setCameraOpen(false)}
                    onCapture={file => {
                        addFiles([file]);
                        setCameraOpen(false);
                    }}
                />
            ) : (
                <Button type="button" size="sm" variant="outline"
                    disabled={disabled || files.length >= 10}
                    onClick={() => setCameraOpen(true)}
                    startIcon={<Camera className="h-4 w-4" />}>
                    Tomar foto
                </Button>
            )}
            {error && <p role="alert" className="text-xs text-error-500">{error}</p>}
            {files.length > 0 && (
                <ul className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-5">
                    {files.map((file, index) => (
                        <li key={`${file.name}-${file.size}-${file.lastModified}`} className="relative min-w-0">
                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                <PhotoPreview file={file} />
                            </div>
                            <button
                                type="button"
                                aria-label={`Quitar foto ${file.name}`}
                                disabled={disabled}
                                onClick={() => {
                                    onChange(files.filter((_, position) => position !== index));
                                    setError('');
                                }}
                                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/75 text-white hover:bg-error-500 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50"
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <p title={file.name} className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{file.name}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}