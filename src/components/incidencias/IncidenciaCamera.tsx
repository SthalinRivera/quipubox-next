'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface IncidenciaCameraProps {
    onCapture: (file: File) => void;
    onClose: () => void;
    disabled?: boolean;
}

export default function IncidenciaCamera({ onCapture, onClose, disabled = false }: IncidenciaCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const activeRef = useRef(false);
    const [ready, setReady] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        let stream: MediaStream | undefined;
        activeRef.current = true;

        async function openCamera() {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('La cámara requiere HTTPS o localhost y un navegador compatible.');
                }
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                    audio: false,
                });
                if (cancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (err) {
                if (cancelled) return;
                stream?.getTracks().forEach(track => track.stop());
                const name = err instanceof Error ? err.name : '';
                setError(name === 'NotAllowedError'
                    ? 'Permite el acceso a la cámara en tu navegador para tomar una foto.'
                    : name === 'NotFoundError'
                        ? 'No se encontró una cámara. Puedes seleccionar una foto de tus archivos.'
                        : name === 'NotReadableError'
                            ? 'No se pudo abrir la cámara. Revisa si otra aplicación la está usando.'
                            : err instanceof Error ? err.message : 'No se pudo abrir la cámara.');
            }
        }

        void openCamera();
        return () => {
            cancelled = true;
            activeRef.current = false;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const capture = () => {
        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight || disabled || capturing) return;
        setCapturing(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('No se pudo preparar la foto.');
            context.drawImage(video, 0, 0);
            canvas.toBlob(blob => {
                if (!activeRef.current) return;
                setCapturing(false);
                if (!blob) {
                    setError('No se pudo capturar la foto. Inténtalo nuevamente.');
                    return;
                }
                onCapture(new File([blob], `incidencia-${Date.now()}.jpg`, { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.9);
        } catch {
            setCapturing(false);
            setError('No se pudo capturar la foto. Inténtalo nuevamente.');
        }
    };

    return (
        <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Cámara</span>
                <button type="button" aria-label="Cerrar cámara" onClick={onClose}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <video ref={videoRef} autoPlay muted playsInline
                aria-label="Vista previa de la cámara"
                onLoadedData={() => setReady(true)}
                className="max-h-56 w-full rounded-lg bg-gray-950 object-contain" />
            {error ? <p role="alert" className="text-xs text-error-500">{error}</p>
                : !ready && <p role="status" className="text-xs text-gray-500">Abriendo cámara…</p>}
            <div className="flex justify-end">
                <Button size="sm" onClick={capture} disabled={!ready || capturing || disabled}
                    startIcon={<Camera className="h-4 w-4" />}>
                    {capturing ? 'Capturando…' : 'Capturar foto'}
                </Button>
            </div>
        </div>
    );
}