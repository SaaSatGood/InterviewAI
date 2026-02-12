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
        title: 'Target Position',
        subtitle: 'Context for better questions',
        company: 'Company Name',
        jobTitle: 'Job Title',
        url: 'Job URL',
        description: 'Job Description',
        descriptionPlaceholder: 'Paste the job description...',
    },
    pt: {
        title: 'Vaga Alvo',
        subtitle: 'Contexto para melhores perguntas',
        company: 'Nome da Empresa',
        jobTitle: 'Cargo',
        url: 'URL da Vaga',
        description: 'Descrição da Vaga',
        descriptionPlaceholder: 'Cole a descrição da vaga...',
    },
    es: {
        title: 'Puesto Objetivo',
        subtitle: 'Contexto para mejores preguntas',
        company: 'Nombre de la Empresa',
        jobTitle: 'Título del Puesto',
        url: 'URL del Empleo',
        description: 'Descripción del Puesto',
        descriptionPlaceholder: 'Pega la descripción del trabajo...',
    },
} as const;

export function JobContext({ className }: JobContextProps) {
    const { jobContext, setJobContext, language } = useAppStore();
    const [localContext, setLocalContext] = useState({
        companyName: jobContext?.companyName || '',
        jobTitle: jobContext?.jobTitle || '',
        jobDescription: jobContext?.jobDescription || '',
        companyUrl: jobContext?.companyUrl || '',
    });

    const t = translations[language] || translations.en;

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

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-neutral-200">{t.title}</p>
                <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded">{t.subtitle}</span>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-neutral-400">{t.company}</label>
                        <div className="relative group">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 transition-colors group-focus-within:text-indigo-400" />
                            <input
                                type="text"
                                value={localContext.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Job Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-neutral-400">{t.jobTitle}</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 transition-colors group-focus-within:text-indigo-400" />
                            <input
                                type="text"
                                value={localContext.jobTitle}
                                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Job Description */}
                <div className="space-y-1.5">
                    <label className="text-xs text-neutral-400">{t.description}</label>
                    <div className="relative group">
                        <textarea
                            value={localContext.jobDescription}
                            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                            placeholder={t.descriptionPlaceholder}
                            rows={3}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
