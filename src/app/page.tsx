"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { ApiKeyManager } from '@/components/ApiKeyManager';

export default function Home() {
  const router = useRouter();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <main className="relative bg-neutral-950 min-h-screen">
      <ApiKeyManager
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
      <LandingPage
        onStartInterview={() => router.push('/interview/setup')}
        onOpenLiveCoach={() => router.push('/live-coach')}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
      />
    </main>
  );
}
