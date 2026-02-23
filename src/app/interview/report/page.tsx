"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewReport } from '@/components/InterviewReport';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { useAppStore } from '@/lib/store';
import { ClientOnly } from '@/components/ClientOnly';

export default function ReportPage() {
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const router = useRouter();
    const { report } = useAppStore();

    useEffect(() => {
        if (!report) {
            router.push('/interview/setup');
        }
    }, [report, router]);

    if (!report) return null;

    return (
        <ClientOnly>
            <main className="relative min-h-screen bg-neutral-950">
                <ApiKeyManager
                    isOpen={isApiKeyModalOpen}
                    onClose={() => setIsApiKeyModalOpen(false)}
                />
                <InterviewReport
                    onOpenSettings={() => setIsApiKeyModalOpen(true)}
                />
            </main>
        </ClientOnly>
    );
}
