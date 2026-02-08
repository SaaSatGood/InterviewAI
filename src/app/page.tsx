"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { InterviewSetup } from '@/components/InterviewSetup';
import { ChatInterface } from '@/components/ChatInterface';
import { InterviewReport } from '@/components/InterviewReport';

export default function Home() {
  const { userProfile, report } = useAppStore();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <main className="relative bg-neutral-950 min-h-screen">
      <ApiKeyManager
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {report ? (
        <InterviewReport onOpenSettings={() => setIsApiKeyModalOpen(true)} />
      ) : !userProfile ? (
        <InterviewSetup onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
      ) : (
        <ChatInterface onOpenSettings={() => setIsApiKeyModalOpen(true)} />
      )}
    </main>
  );
}
