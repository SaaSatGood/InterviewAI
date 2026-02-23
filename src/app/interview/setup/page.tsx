"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewSetup } from '@/components/InterviewSetup';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { useAppStore } from '@/lib/store';
import { ClientOnly } from '@/components/ClientOnly';

export default function SetupPage() {
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const router = useRouter();
    const { userProfile } = useAppStore();

    useEffect(() => {
        // If profile is fully completely set (e.g. they clicked Start)
        // Check if condition met to navigate to session
        if (userProfile && userProfile.position && userProfile.stacks?.length > 0) {
            router.push('/interview/session');
        }
    }, [userProfile, router]);

    return (
        <ClientOnly>
            <main className="relative min-h-screen bg-neutral-950">
                <ApiKeyManager
                    isOpen={isApiKeyModalOpen}
                    onClose={() => setIsApiKeyModalOpen(false)}
                />
                <InterviewSetup
                    onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                />
            </main>
        </ClientOnly>
    );
}
