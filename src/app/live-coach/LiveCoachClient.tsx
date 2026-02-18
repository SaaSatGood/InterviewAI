'use client';

import { useRouter } from 'next/navigation';
import { LiveCoach } from '@/components/LiveCoach';
import { ClientOnly } from '@/components/ClientOnly';

export function LiveCoachClient() {
    const router = useRouter();
    return (
        <ClientOnly>
            <LiveCoach onBack={() => router.push('/')} />
        </ClientOnly>
    );
}
