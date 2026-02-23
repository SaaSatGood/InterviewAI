'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Target } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            // Se não estiver logado e tentar acessar rota restrita, redireciona
            const publicRoutes = ['/login', '/signup', '/'];
            if (!publicRoutes.includes(pathname)) {
                router.push('/login');
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md animate-pulse">
                        <Target className="w-6 h-6 text-white animate-spin-slow" />
                    </div>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest animate-pulse">
                        Autenticando...
                    </p>
                </div>
            </div>
        );
    }

    // Se estiver na home e logado, ou qualquer outra rota, apenas renderiza
    return <>{children}</>;
}
