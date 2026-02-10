"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ClientOnly } from '@/components/ClientOnly';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { InterviewSetup } from '@/components/InterviewSetup';
import { ChatInterface } from '@/components/ChatInterface';
import { InterviewReport } from '@/components/InterviewReport';
import { LiveCoach } from '@/components/LiveCoach';

export default function Home() {
  const { userProfile, report } = useAppStore();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLiveCoach, setIsLiveCoach] = useState(false);

  return (
    <ClientOnly>
      <main className="relative bg-neutral-950 min-h-screen">
        <ApiKeyManager
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
        />

        {isLiveCoach ? (
          <LiveCoach
            onBack={() => setIsLiveCoach(false)}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        ) : report ? (
          <InterviewReport onOpenSettings={() => setIsApiKeyModalOpen(true)} />
        ) : !userProfile ? (
          <InterviewSetup
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onOpenLiveCoach={() => setIsLiveCoach(true)}
          />
        ) : (
          <ChatInterface onOpenSettings={() => setIsApiKeyModalOpen(true)} />
        )}
      </main>
    </ClientOnly>
  );
}
