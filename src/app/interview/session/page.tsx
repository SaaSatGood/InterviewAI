"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/ChatInterface';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { useAppStore } from '@/lib/store';
import { ClientOnly } from '@/components/ClientOnly';

export default function SessionPage() {
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const router = useRouter();
    const { userProfile, report } = useAppStore();

    useEffect(() => {
        if (!userProfile) {
            router.push('/interview/setup');
        } else if (report) {
            router.push('/interview/report');
        }
    }, [userProfile, report, router]);

    if (!userProfile) return null; // Avoid rendering if redirect is happening

    return (
        <ClientOnly>
            <main className="relative min-h-screen bg-neutral-950">
                <ApiKeyManager
                    isOpen={isApiKeyModalOpen}
                    onClose={() => setIsApiKeyModalOpen(false)}
                />
                <ChatInterface
                    onOpenSettings={() => setIsApiKeyModalOpen(true)}
                />
            </main>
        </ClientOnly>
    );
}
