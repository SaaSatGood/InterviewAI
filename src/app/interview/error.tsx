'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function InterviewError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Interview Segment Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-neutral-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-orange-500/50" />

                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Algo deu errado</h2>
                <p className="text-neutral-400 mb-8 whitespace-pre-wrap">
                    Encontramos uma instabilidade no simulador de entrevista. {error.message ? `Detalhe: ${error.message}` : ''}
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-white text-black hover:bg-neutral-200"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Tentar Restaurar
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="w-full border-neutral-800 hover:bg-neutral-800"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Voltar ao Início
                    </Button>
                </div>
            </div>
        </div>
    );
}
