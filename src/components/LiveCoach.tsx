'use client';

// LiveCoach — Simplified Layout (Pulse + Clear Feedback)
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAudioCapture, CaptureMode } from '@/hooks/useAudioCapture';
import { useTranscription, TranscriptionEngine } from '@/hooks/useTranscription';
import { useLiveCoach } from '@/hooks/useLiveCoach';
import { AudioSetup } from './AudioSetup';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/utils/supabase/client';
import { LoginButton } from './LoginButton';
import { LiveHeader } from './live-session/LiveHeader';
// New Components
import { AudioVisualizer } from './live-session/AudioVisualizer';
import { CoachFeed } from './live-session/CoachFeed';

interface LiveCoachProps {
    onBack: () => void;
    onOpenApiKeyModal?: () => void;
}

export function LiveCoach({ onBack, onOpenApiKeyModal }: LiveCoachProps) {
    const supabase = createClient();
    const store = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { getActiveKey, apiKeys, language } = mounted
        ? store
        : { getActiveKey: () => undefined, apiKeys: [], language: 'pt' };

    const [showSetup, setShowSetup] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const audioCapture = useAudioCapture();
    const transcription = useTranscription();
    const coach = useLiveCoach();

    // Check auth on mount
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setIsAuthenticated(!!session);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openAiKey = mounted
        ? apiKeys.find((k: { provider: string }) => k.provider === 'openai')
        : undefined;

    // Timer
    useEffect(() => {
        if (!startTime) return;
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    // Trigger coach analysis when new segments arrive
    useEffect(() => {
        if (transcription.segments.length > 0) {
            coach.analyzeTranscript(transcription.segments);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcription.segments]);

    // Feed volume data to transcription for speaker detection
    useEffect(() => {
        if (audioCapture.isCapturing && 'updateSpeaker' in transcription) {
            (transcription as any).updateSpeaker(
                audioCapture.micVolume,
                audioCapture.systemVolume
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioCapture.micVolume, audioCapture.systemVolume, audioCapture.isCapturing]);

    const handleStart = useCallback(
        async (mode: CaptureMode, engine: TranscriptionEngine) => {
            const apiKey = engine === 'browser' ? null : openAiKey?.key || null;
            if (engine !== 'browser' && !apiKey) {
                console.error('No OpenAI key available for transcription');
                return;
            }
            setShowSetup(false);
            const result = await audioCapture.startCapture(mode);
            if (result?.mixedStream) {
                transcription.startListening(
                    result.mixedStream,
                    apiKey,
                    mode,
                    engine,
                    language || 'pt'
                );
                setStartTime(Date.now());
            } else {
                setShowSetup(true);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [openAiKey, language]
    );

    const handleStop = useCallback(() => {
        transcription.stopListening();
        audioCapture.stopCapture();
        setStartTime(null);
        setElapsedTime(0);
        onBack();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const transcriptionStatus =
        transcription.status === 'connected'
            ? 'connected'
            : transcription.status === 'connecting'
                ? 'connecting'
                : transcription.status === 'idle'
                    ? 'idle'
                    : 'error';

    // Loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-neutral-950">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-neutral-950 relative overflow-hidden font-sans selection:bg-white/30">
            {/* Login Overlay */}
            {!isAuthenticated && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Login Necessário</h2>
                        <p className="text-neutral-400 mb-8">
                            Faça login para acessar o Live Coach gratuitamente.
                        </p>
                        <div className="flex justify-center">
                            <LoginButton />
                        </div>
                        <button
                            onClick={onBack}
                            className="w-full mt-4 py-3 text-neutral-500 hover:text-neutral-300 transition text-sm font-medium"
                        >
                            Go Back
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Audio Setup Modal */}
            <AnimatePresence>
                {showSetup && (
                    <AudioSetup
                        onStart={handleStart}
                        onClose={onBack}
                        onOpenApiKeyModal={onOpenApiKeyModal}
                    />
                )}
            </AnimatePresence>

            {/* ── NEW LAYOUT ── */}

            {/* 1. Header */}
            <LiveHeader
                status={transcriptionStatus as 'connected' | 'connecting' | 'error' | 'idle'}
                elapsedTime={elapsedTime > 0 ? formatTime(elapsedTime) : '00:00'}
                micActive={audioCapture.isCapturing && !audioCapture.isMuted}
                onEndSession={handleStop}
                onOpenSettings={onOpenApiKeyModal}
            />

            {/* 2. Main Workspace (Split View) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left: Audio & Transcript (45%) */}
                <main className="flex-1 md:flex-[0.55] relative bg-neutral-950 border-r border-white/5">
                    <AudioVisualizer
                        isSpeaking={audioCapture.micVolume > 0.05}
                        micVolume={audioCapture.micVolume}
                        segments={transcription.segments}
                    />
                </main>

                {/* Right: Coach Feed (55%) */}
                <aside className="flex-1 md:flex-[0.45] bg-neutral-900 h-full relative z-10 shadow-2xl">
                    <CoachFeed
                        tips={coach.tips}
                        isAnalyzing={coach.isAnalyzing}
                    />
                </aside>

            </div>

            {/* Error Toast */}
            <AnimatePresence>
                {(audioCapture.error || transcription.error || coach.error) && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-neutral-900 border border-white/20 backdrop-blur-md rounded-full shadow-xl text-white text-sm font-medium flex items-center gap-2 max-w-sm text-center"
                    >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                        {audioCapture.error || transcription.error || coach.error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
