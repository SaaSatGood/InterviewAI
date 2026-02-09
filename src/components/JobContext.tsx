"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Briefcase, Link, FileText, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/lib/store';

interface JobContextProps {
    className?: string;
}

const translations = {
    en: {
        title: 'Target Position (Optional)',
        subtitle: 'Add details for personalized questions',
        company: 'Company Name',
        jobTitle: 'Job Title',
        url: 'Job URL (LinkedIn, Glassdoor, etc)',
        description: 'Job Description',
        descriptionPlaceholder: 'Paste the job description or key requirements...',
        fetchUrl: 'Fetch from URL',
    },
    pt: {
        title: 'Vaga Alvo (Opcional)',
        subtitle: 'Adicione detalhes para perguntas personalizadas',
        company: 'Nome da Empresa',
        jobTitle: 'Cargo',
        url: 'URL da Vaga (LinkedIn, Glassdoor, etc)',
        description: 'Descrição da Vaga',
        descriptionPlaceholder: 'Cole a descrição da vaga ou requisitos...',
        fetchUrl: 'Buscar da URL',
    },
    es: {
        title: 'Puesto Objetivo (Opcional)',
        subtitle: 'Agrega detalles para preguntas personalizadas',
        company: 'Nombre de la Empresa',
        jobTitle: 'Título del Puesto',
        url: 'URL del Empleo (LinkedIn, Glassdoor, etc)',
        description: 'Descripción del Puesto',
        descriptionPlaceholder: 'Pega la descripción del trabajo o requisitos...',
        fetchUrl: 'Obtener de URL',
    },
} as const;

export function JobContext({ className }: JobContextProps) {
    const { jobContext, setJobContext, language } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [localContext, setLocalContext] = useState({
        companyName: jobContext?.companyName || '',
        jobTitle: jobContext?.jobTitle || '',
        jobDescription: jobContext?.jobDescription || '',
        companyUrl: jobContext?.companyUrl || '',
    });

    const t = translations[language] || translations.en;

    // Save to store when values change
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localContext.companyName || localContext.jobTitle || localContext.jobDescription || localContext.companyUrl) {
                setJobContext(localContext);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [localContext, setJobContext]);

    const handleInputChange = (field: keyof typeof localContext, value: string) => {
        setLocalContext(prev => ({ ...prev, [field]: value }));
    };

    const fetchFromUrl = async () => {
        if (!localContext.companyUrl) return;

        setIsLoading(true);
        try {
            // Simple metadata extraction - in production you'd use a server-side API
            // For now, just set the URL and let the AI use it as context
            setLocalContext(prev => ({
                ...prev,
                // In a real implementation, fetch title/company from the URL
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-neutral-800 rounded-lg">
                    <Building2 className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{t.title}</p>
                    <p className="text-xs text-neutral-500">{t.subtitle}</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Company Name */}
                <div>
                    <label className="text-xs text-neutral-400 mb-1 block">{t.company}</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            value={localContext.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            placeholder="Google, Microsoft, Startup XYZ..."
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                        />
                    </div>
                </div>

                {/* Job Title */}
                <div>
                    <label className="text-xs text-neutral-400 mb-1 block">{t.jobTitle}</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            value={localContext.jobTitle}
                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                            placeholder="Senior Frontend Engineer, Tech Lead..."
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                        />
                    </div>
                </div>

                {/* Job URL */}
                <div>
                    <label className="text-xs text-neutral-400 mb-1 block">{t.url}</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="url"
                                value={localContext.companyUrl}
                                onChange={(e) => handleInputChange('companyUrl', e.target.value)}
                                placeholder="https://linkedin.com/jobs/..."
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Job Description */}
                <div>
                    <label className="text-xs text-neutral-400 mb-1 block">{t.description}</label>
                    <div className="relative">
                        <textarea
                            value={localContext.jobDescription}
                            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                            placeholder={t.descriptionPlaceholder}
                            rows={4}
                            className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 resize-none"
                        />
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                        {localContext.jobDescription.length}/2000
                    </p>
                </div>
            </div>

            {/* Summary indicator */}
            {(localContext.companyName || localContext.jobTitle) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-2 bg-neutral-800/50 rounded-lg"
                >
                    <p className="text-xs text-neutral-400">
                        📎 {localContext.companyName && `${localContext.companyName}`}
                        {localContext.companyName && localContext.jobTitle && ' • '}
                        {localContext.jobTitle && localContext.jobTitle}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
