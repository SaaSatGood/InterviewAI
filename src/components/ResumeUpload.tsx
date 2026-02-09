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
        dragDrop: 'Drag & drop your resume here',
        or: 'or',
        browse: 'Browse files',
        uploaded: 'Resume uploaded',
        clear: 'Remove',
        processing: 'Processing...',
    },
    pt: {
        title: 'Envie seu Currículo',
        subtitle: 'Formato PDF, máx 10MB',
        dragDrop: 'Arraste e solte seu currículo aqui',
        or: 'ou',
        browse: 'Procurar arquivos',
        uploaded: 'Currículo enviado',
        clear: 'Remover',
        processing: 'Processando...',
    },
    es: {
        title: 'Sube tu Currículum',
        subtitle: 'Formato PDF, máx 10MB',
        dragDrop: 'Arrastra y suelta tu currículum aquí',
        or: 'o',
        browse: 'Buscar archivos',
        uploaded: 'Currículum subido',
        clear: 'Eliminar',
        processing: 'Procesando...',
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

    // Already uploaded state
    if (resumeData) {
        return (
            <div className={clsx("p-4 rounded-xl border border-neutral-700 bg-neutral-800/50", className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{t.uploaded}</p>
                            <p className="text-xs text-neutral-400">{resumeData.fileName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        {t.clear}
                    </button>
                </div>

                {/* Preview snippet */}
                <div className="mt-3 p-3 bg-neutral-900 rounded-lg max-h-24 overflow-hidden">
                    <p className="text-xs text-neutral-500 line-clamp-3">
                        {resumeData.summary.slice(0, 200)}...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <p className="text-sm font-medium text-white mb-2">{t.title}</p>
            <p className="text-xs text-neutral-500 mb-3">{t.subtitle}</p>

            <motion.div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                    "relative p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                    isDragging
                        ? "border-white bg-neutral-800"
                        : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/30"
                )}
                animate={{
                    scale: isDragging ? 1.02 : 1,
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center text-center">
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
                            <p className="text-sm text-neutral-400">{t.processing}</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-neutral-800 rounded-xl mb-3">
                                <Upload className="w-6 h-6 text-neutral-400" />
                            </div>
                            <p className="text-sm text-neutral-300 mb-1">{t.dragDrop}</p>
                            <p className="text-xs text-neutral-500 mb-2">{t.or}</p>
                            <span className="text-xs text-white bg-neutral-700 hover:bg-neutral-600 px-3 py-1.5 rounded-lg transition-colors">
                                {t.browse}
                            </span>
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
                        className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-xs text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
