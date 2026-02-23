'use client';

// LiveCoach — Simplified Layout (Pulse + Clear Feedback)
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelRightClose, PanelRightOpen, Lock } from 'lucide-react';
import { useAudioCapture, CaptureMode } from '@/hooks/useAudioCapture';
import { useTranscription, TranscriptionEngine } from '@/hooks/useTranscription';
import { useLiveCoach } from '@/hooks/useLiveCoach';
import { AudioSetup } from './AudioSetup';
import { useAppStore } from '@/lib/store';
import { LiveHeader } from './live-session/LiveHeader';
import { trackEvent } from '@/lib/firebase/analytics';
import { useAuth } from '@/hooks/useAuth';
import { saveLiveSession } from '@/lib/firebase/firestore';
import { AudioVisualizer } from './live-session/AudioVisualizer';
import { CoachFeed } from './live-session/CoachFeed';

interface LiveCoachProps {
    onBack: () => void;
    onOpenApiKeyModal?: () => void;
}

export function LiveCoach({ onBack, onOpenApiKeyModal }: LiveCoachProps) {
    const apiKeys = useAppStore(state => state.apiKeys);
    const language = useAppStore(state => state.language);
    const aiMode = useAppStore(state => state.aiMode);
    const jobContext = useAppStore(state => state.jobContext);

    const [mounted, setMounted] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Sidebar hidden by default for focus

    useEffect(() => {
        setMounted(true);
    }, []);
    const [showSetup, setShowSetup] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const audioCapture = useAudioCapture();
    const transcription = useTranscription();
    const coach = useLiveCoach();
    const { user } = useAuth();

    const isLoading = !mounted;

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

                trackEvent('start_live_coach', {
                    mode,
                    engine,
                    systemAudio: mode === 'call'
                });
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

        trackEvent('end_live_coach', {
            durationSeconds: elapsedTime,
            insightsCount: coach.tips.length
        });

        if (user) {
            saveLiveSession(user.uid, {
                mode: aiMode || 'sales',
                context: jobContext?.jobDescription || 'Sem contexto definido',
                durationSeconds: elapsedTime,
                insightsGenerated: coach.tips.length
            }).catch(err => console.error('[LiveCoach] Failed to save session:', err));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elapsedTime, coach.tips.length, user, aiMode, jobContext]);

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
        <div className="h-screen flex flex-col bg-neutral-950 relative overflow-hidden font-sans selection:bg-white/30 text-white">

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

            {/* 1. Header */}
            <LiveHeader
                status={transcriptionStatus as 'connected' | 'connecting' | 'error' | 'idle'}
                elapsedTime={elapsedTime > 0 ? formatTime(elapsedTime) : '00:00'}
                micActive={audioCapture.isCapturing && !audioCapture.isMuted}
                isMuted={audioCapture.isMuted}
                hasSystemAudio={audioCapture.hasSystemAudio}
                tipsCount={coach.tips.length}
                onEndSession={handleStop}
                onToggleMute={audioCapture.toggleMute}
                onOpenSettings={onOpenApiKeyModal}
            />

            {/* 2. Main Workspace (Focus on Coach) */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left/Main: Coach Feed (Takes up most of the screen) */}
                <main className={`flex-1 flex flex-col transition-all duration-300 ${showSidebar ? 'mr-0' : 'mr-0'} bg-neutral-950 relative`}>

                    {/* Toggle Sidebar Button (Floating) */}
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-neutral-900 border border-white/10 text-white shadow-lg hover:bg-neutral-800 transition-colors"
                        title={showSidebar ? "Ocultar Transcrição" : "Ver Transcrição"}
                    >
                        {showSidebar ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                    </button>

                    <CoachFeed
                        tips={coach.tips}
                        isAnalyzing={coach.isAnalyzing}
                    />

                    {/* Reactive Ambient Glow when sidebar is closed */}
                    {!showSidebar && audioCapture.isCapturing && (
                        <div className="absolute inset-x-0 bottom-0 h-1.5 z-50 overflow-hidden">
                            <motion.div
                                className="h-full origin-left rounded-full"
                                style={{
                                    background: 'linear-gradient(90deg, rgba(16,185,129,0.6), rgba(6,182,212,0.6), rgba(99,102,241,0.4))',
                                    filter: `blur(${Math.max(0, audioCapture.micVolume * 3)}px)`,
                                }}
                                animate={{
                                    scaleX: Math.min(audioCapture.micVolume * 3 + 0.05, 1),
                                    opacity: audioCapture.micVolume > 0.02 ? 0.8 : 0.2,
                                }}
                                transition={{ type: "tween", duration: 0.08 }}
                            />
                        </div>
                    )}
                </main>

                {/* Right: Sidebar (Audio & Transcript) - Collapsible */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 400, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="bg-neutral-900 border-l border-white/10 h-full relative z-40 overflow-hidden flex-shrink-0"
                        >
                            <div className="w-[400px] h-full">
                                <AudioVisualizer
                                    isSpeaking={audioCapture.micVolume > 0.05}
                                    micVolume={audioCapture.micVolume}
                                    segments={transcription.segments}
                                />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

            </div>

            {/* Error Toast */}
            <AnimatePresence>
                {(audioCapture.error || transcription.error || coach.error) && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-red-950/90 border border-red-500/50 backdrop-blur-md rounded-full shadow-xl text-red-200 text-sm font-medium flex items-center gap-2 max-w-sm text-center"
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        {audioCapture.error || transcription.error || coach.error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
