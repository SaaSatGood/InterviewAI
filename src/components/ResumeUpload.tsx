"use client";

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { parseResume, ResumeData, ParseError } from '@/lib/resumeParser';
import { useAppStore } from '@/lib/store';

interface ResumeUploadProps {
    onUploadComplete?: (data: ResumeData) => void;
    className?: string;
}

const translations = {
    en: {
        title: 'Upload Your Resume',
        subtitle: 'PDF format, max 10MB',
        dragDrop: 'Drag or Drop',
        dragDropDesc: 'Upload a PDF',
        browse: 'Browse',
        uploaded: 'Resume Uploaded',
        clear: 'Remove',
        processing: 'Analyzing...',
    },
    pt: {
        title: 'Envie seu Currículo',
        subtitle: 'Formato PDF, máx 10MB',
        dragDrop: 'Arraste ou Solte',
        dragDropDesc: 'Envie um PDF',
        browse: 'Procurar',
        uploaded: 'Currículo Enviado',
        clear: 'Remover',
        processing: 'Analisando...',
    },
    es: {
        title: 'Sube tu Currículum',
        subtitle: 'Formato PDF, máx 10MB',
        dragDrop: 'Arrastra y Suelta',
        dragDropDesc: 'Sube un PDF',
        browse: 'Buscar',
        uploaded: 'Currículum Subido',
        clear: 'Eliminar',
        processing: 'Analizando...',
    },
} as const;

export function ResumeUpload({ onUploadComplete, className }: ResumeUploadProps) {
    const { resumeData, setResumeData, language } = useAppStore();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const t = translations[language] || translations.en;

    const handleFile = useCallback(async (file: File) => {
        setError(null);
        setIsUploading(true);

        try {
            const data = await parseResume(file);
            setResumeData(data);
            onUploadComplete?.(data);
        } catch (err) {
            const parseError = err as ParseError;
            setError(parseError.message || 'Failed to parse resume');
        } finally {
            setIsUploading(false);
        }
    }, [setResumeData, onUploadComplete]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleClear = useCallback(() => {
        setResumeData(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [setResumeData]);

    if (resumeData) {
        return (
            <div className={clsx("group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20", className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/20">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{t.uploaded}</p>
                            <p className="text-xs text-neutral-300">{resumeData.fileName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-neutral-100">{t.title}</p>
                <span className="text-xs text-neutral-400 bg-white/10 px-2.5 py-1 rounded-md">{t.subtitle}</span>
            </div>

            <motion.div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                animate={{
                    borderColor: isDragging ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                }}
                className="relative cursor-pointer rounded-xl border-2 border-dashed border-white/10 p-8 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center text-center">
                    {isUploading ? (
                        <>
                            <div className="relative mb-4">
                                <div className="absolute inset-0 animate-pulse rounded-full bg-white/10 blur-xl"></div>
                                <Loader2 className="relative h-8 w-8 animate-spin text-white" />
                            </div>
                            <p className="text-sm font-medium text-neutral-300">{t.processing}</p>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 rounded-full bg-neutral-900 p-3 ring-1 ring-white/10 shadow-lg">
                                <Upload className="h-5 w-5 text-neutral-400" />
                            </div>
                            <p className="mb-2 text-sm font-semibold text-neutral-200">
                                <span className="text-white hover:underline underline-offset-4">{t.browse}</span> {t.dragDrop}
                            </p>
                            <p className="text-xs text-neutral-400">
                                PDF, DOCX (Max 10MB)
                            </p>
                        </>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        <p className="text-xs text-red-200">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
