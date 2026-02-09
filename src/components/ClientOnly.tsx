"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useAppStore } from '@/lib/store';
import { detectBrowserLanguage } from '@/lib/i18n';

interface ClientOnlyProps {
    children: ReactNode;
}

// This component ensures content only renders on client after hydration
// to avoid SSR/client mismatch with language detection
export function ClientOnly({ children }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const { language, setLanguage } = useAppStore();

    useEffect(() => {
        // Detect and set browser language on first mount
        if (!language || language === 'en') {
            const detectedLang = detectBrowserLanguage();
            if (detectedLang !== language) {
                setLanguage(detectedLang);
            }
        }
        setHasMounted(true);
    }, [language, setLanguage]);

    if (!hasMounted) {
        // Return a loading placeholder that matches the expected server render
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl animate-pulse"></div>
                    <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
