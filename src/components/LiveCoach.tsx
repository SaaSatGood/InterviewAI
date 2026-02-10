'use client';

// LiveCoach — Main Live Interview Coach page with split-view layout
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Settings, ArrowLeft, Volume2, Key } from 'lucide-react';
import { useAudioCapture, CaptureMode } from '@/hooks/useAudioCapture';
import { useTranscription, TranscriptionEngine } from '@/hooks/useTranscription';
import { useLiveCoach } from '@/hooks/useLiveCoach';
import { LiveTranscript } from './LiveTranscript';
import { CoachTips } from './CoachTips';
import { AudioSetup } from './AudioSetup';
import { useAppStore } from '@/lib/store';

interface LiveCoachProps {
    onBack: () => void;
    onOpenApiKeyModal?: () => void;
}

export function LiveCoach({ onBack, onOpenApiKeyModal }: LiveCoachProps) {
    const { getActiveKey, apiKeys, language } = useAppStore();
    const [showSetup, setShowSetup] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);

    const audioCapture = useAudioCapture();
    const transcription = useTranscription();
    const coach = useLiveCoach();

    // Get OpenAI key specifically (required for Realtime API)
    const openAiKey = apiKeys.find(k => k.provider === 'openai');

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
            (transcription as unknown as { updateSpeaker: (mic: number, sys: number) => void })
                .updateSpeaker(audioCapture.micVolume, audioCapture.systemVolume);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioCapture.micVolume, audioCapture.systemVolume]);

    const handleStart = useCallback(async (mode: CaptureMode, engine: TranscriptionEngine) => {
        // Browser engine doesn't need API key
        const apiKey = engine === 'browser' ? null : openAiKey?.key || null;

        if (engine !== 'browser' && !apiKey) {
            console.error('No OpenAI key available for transcription');
            return;
        }

        setShowSetup(false);

        // Start capture and get streams directly (fixes timing issue)
        const result = await audioCapture.startCapture(mode);

        if (result?.mixedStream) {
            // Pass language setting (defaults to Portuguese for Brazilian users)
            transcription.startListening(result.mixedStream, apiKey, mode, engine, language || 'pt');
            setStartTime(Date.now());
        } else {
            // Audio capture failed — show setup again
            setShowSetup(true);
        }
    }, [openAiKey, audioCapture, transcription, language]);

    const handleStop = useCallback(() => {
        transcription.stopListening();
        audioCapture.stopCapture();
        setStartTime(null);
        setElapsedTime(0);
    }, [transcription, audioCapture]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Volume bar component
    const VolumeBar = ({ level, label, color }: { level: number; label: string; color: string }) => (
        <div className="flex items-center gap-2">
            <Volume2 className={`w-3 h-3 ${color}`} />
            <span className="text-[10px] text-neutral-500 w-12">{label}</span>
            <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                    animate={{ width: `${Math.min(level * 500, 100)}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-neutral-950">
            {/* Setup Modal */}
            <AnimatePresence>
                {showSetup && (
                    <AudioSetup
                        onStart={handleStart}
                        onClose={onBack}
                        onOpenApiKeyModal={onOpenApiKeyModal}
                    />
                )}
            </AnimatePresence>

            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1.5 hover:bg-neutral-800 rounded-lg transition"
                    >
                        <ArrowLeft className="w-4 h-4 text-neutral-400" />
                    </button>

                    <div className="flex items-center gap-2">
                        {audioCapture.isCapturing && (
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        <span className="text-sm font-bold text-white">LIVE COACH</span>
                        {startTime && (
                            <span className="text-sm font-mono text-neutral-400">{formatTime(elapsedTime)}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Volume meters */}
                    {audioCapture.isCapturing && (
                        <div className="hidden sm:flex flex-col gap-0.5">
                            <VolumeBar level={audioCapture.micVolume} label="Mic" color="text-emerald-400" />
                            {audioCapture.mode === 'call' && (
                                <VolumeBar
                                    level={audioCapture.systemVolume}
                                    label={audioCapture.hasSystemAudio ? "Sistema" : "Sistema ⚠️"}
                                    color={audioCapture.hasSystemAudio ? "text-blue-400" : "text-amber-400"}
                                />
                            )}
                        </div>
                    )}

                    {/* Connection status */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${transcription.status === 'connected' ? 'bg-emerald-500/20 text-emerald-300'
                        : transcription.status === 'connecting' ? 'bg-yellow-500/20 text-yellow-300'
                            : transcription.status === 'error' ? 'bg-red-500/20 text-red-300'
                                : 'bg-neutral-800 text-neutral-500'
                        }`}>
                        {transcription.status}
                    </span>

                    {/* Controls */}
                    {audioCapture.isCapturing ? (
                        <>
                            {/* Mute button */}
                            <button
                                onClick={() => {
                                    // Toggle audio capture mute
                                    audioCapture.toggleMute();
                                    // Also pause/resume transcription (especially for Web Speech API)
                                    if (audioCapture.isMuted) {
                                        transcription.resumeListening();
                                    } else {
                                        transcription.pauseListening();
                                    }
                                }}
                                className={`p-1.5 rounded-lg transition ${audioCapture.isMuted
                                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                    }`}
                                title={audioCapture.isMuted ? 'Ativar microfone' : 'Desativar microfone'}
                            >
                                {audioCapture.isMuted ? (
                                    <MicOff className="w-4 h-4" />
                                ) : (
                                    <Mic className="w-4 h-4" />
                                )}
                            </button>

                            {/* Stop button */}
                            <button
                                onClick={handleStop}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm"
                            >
                                <Square className="w-3.5 h-3.5" />
                                Parar
                            </button>
                        </>
                    ) : !showSetup ? (
                        <button
                            onClick={() => setShowSetup(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition text-sm"
                        >
                            <Mic className="w-3.5 h-3.5" />
                            Iniciar
                        </button>
                    ) : null}

                    {/* API Key button */}
                    {onOpenApiKeyModal && (
                        <button
                            onClick={onOpenApiKeyModal}
                            className="p-1.5 hover:bg-neutral-800 rounded-lg transition"
                            title="Gerenciar API Keys"
                        >
                            <Key className="w-4 h-4 text-neutral-500" />
                        </button>
                    )}

                    <button
                        onClick={() => setShowSetup(true)}
                        className="p-1.5 hover:bg-neutral-800 rounded-lg transition"
                        title="Configurações"
                    >
                        <Settings className="w-4 h-4 text-neutral-500" />
                    </button>
                </div>
            </div>

            {/* Audio capture error/warning toast */}
            {audioCapture.error && audioCapture.isCapturing && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30">
                    <p className="text-xs text-amber-300">{audioCapture.error}</p>
                </div>
            )}

            {/* Main content — Split view */}
            <div className="flex-1 flex min-h-0">
                {/* Left: Transcript */}
                <div className="flex-1 border-r border-neutral-800 min-w-0">
                    <LiveTranscript
                        segments={transcription.segments}
                        currentPartial={transcription.currentPartial}
                        currentSpeaker={transcription.currentSpeaker}
                    />
                </div>

                {/* Right: Coach Tips */}
                <div className="w-80 lg:w-96 min-w-0 flex-shrink-0">
                    <CoachTips
                        tips={coach.tips}
                        isAnalyzing={coach.isAnalyzing}
                        error={coach.error}
                    />
                </div>
            </div>

            {/* Error bar */}
            <AnimatePresence>
                {(audioCapture.error || transcription.error || coach.error) && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs text-center"
                    >
                        {audioCapture.error || transcription.error || coach.error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
