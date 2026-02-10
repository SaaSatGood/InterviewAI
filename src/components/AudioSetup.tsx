'use client';

// AudioSetup — Modal for configuring audio capture sources
// Includes transcription engine selection with free Browser option
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Monitor, Radio, X, AlertTriangle, Key, Zap, Clock, Globe } from 'lucide-react';
import { CaptureMode } from '@/hooks/useAudioCapture';
import { TranscriptionEngine, isWebSpeechSupported } from '@/hooks/useTranscription';
import { useAppStore } from '@/lib/store';

interface AudioSetupProps {
    onStart: (mode: CaptureMode, engine: TranscriptionEngine) => void;
    onClose: () => void;
    onOpenApiKeyModal?: () => void;
}

export function AudioSetup({ onStart, onClose, onOpenApiKeyModal }: AudioSetupProps) {
    const [selectedMode, setSelectedMode] = useState<CaptureMode>('call');
    const [selectedEngine, setSelectedEngine] = useState<TranscriptionEngine>('browser');
    const [webSpeechSupported, setWebSpeechSupported] = useState(true);
    const { resumeData, jobContext, apiKeys, language } = useAppStore();

    // Check Web Speech API support on mount
    useEffect(() => {
        setWebSpeechSupported(isWebSpeechSupported());
    }, []);

    // Check for OpenAI API key
    const openAiKey = useMemo(() => {
        return apiKeys.find(k => k.provider === 'openai');
    }, [apiKeys]);

    const hasValidKey = !!openAiKey;

    // Browser engine doesn't need API key
    const needsApiKey = selectedEngine !== 'browser';
    const canStart = selectedEngine === 'browser' || hasValidKey;

    const isChromium = typeof window !== 'undefined' &&
        /chrome|chromium|edg/i.test(navigator.userAgent) &&
        !/firefox|safari/i.test(navigator.userAgent);

    const modes: { id: CaptureMode; icon: React.ReactNode; title: string; desc: string; available: boolean }[] = [
        {
            id: 'call',
            icon: <Monitor className="w-5 h-5" />,
            title: language === 'pt' ? 'Chamada de Vídeo' : language === 'es' ? 'Videollamada' : 'Video Call',
            desc: 'Zoom, Meet, Teams',
            available: isChromium,
        },
        {
            id: 'presential',
            icon: <Radio className="w-5 h-5" />,
            title: language === 'pt' ? 'Presencial' : language === 'es' ? 'Presencial' : 'In-Person',
            desc: language === 'pt' ? 'Microfone ambiente' : language === 'es' ? 'Micrófono ambiente' : 'Room microphone',
            available: true,
        },
    ];

    const engines: { id: TranscriptionEngine; icon: React.ReactNode; title: string; desc: string; badge: string; badgeColor: string; available: boolean }[] = [
        {
            id: 'browser',
            icon: <Globe className="w-5 h-5" />,
            title: language === 'pt' ? 'Navegador' : language === 'es' ? 'Navegador' : 'Browser',
            desc: language === 'pt'
                ? '100% gratuito, sem API key'
                : language === 'es'
                    ? '100% gratis, sin API key'
                    : '100% free, no API key',
            badge: language === 'pt' ? 'GRÁTIS' : language === 'es' ? 'GRATIS' : 'FREE',
            badgeColor: 'bg-emerald-500/20 text-emerald-300',
            available: webSpeechSupported,
        },
        {
            id: 'whisper',
            icon: <Clock className="w-5 h-5" />,
            title: 'Whisper',
            desc: language === 'pt'
                ? 'Delay 5s, requer API key'
                : language === 'es'
                    ? 'Delay 5s, requiere API key'
                    : '5s delay, requires API key',
            badge: '$0.006/min',
            badgeColor: 'bg-blue-500/20 text-blue-300',
            available: true,
        },
        {
            id: 'realtime',
            icon: <Zap className="w-5 h-5" />,
            title: 'Realtime',
            desc: language === 'pt'
                ? 'Baixa latência, tier pago'
                : language === 'es'
                    ? 'Baja latencia, tier pago'
                    : 'Low latency, paid tier',
            badge: '$0.06/min',
            badgeColor: 'bg-violet-500/20 text-violet-300',
            available: true,
        },
    ];

    const apiKeyError = needsApiKey && !hasValidKey ? (
        language === 'pt'
            ? 'Adicione uma API Key da OpenAI'
            : language === 'es'
                ? 'Agregue una API Key de OpenAI'
                : 'Add an OpenAI API Key'
    ) : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Mic className="w-5 h-5 text-emerald-400" />
                            Live Coach
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded-lg transition">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Transcription Engine Selection */}
                <div className="mb-4">
                    <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">
                        {language === 'pt' ? 'Motor de Transcrição' : language === 'es' ? 'Motor de Transcripción' : 'Transcription Engine'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {engines.map(engine => (
                            <button
                                key={engine.id}
                                onClick={() => engine.available && setSelectedEngine(engine.id)}
                                disabled={!engine.available}
                                className={`p-2.5 rounded-xl border text-center transition-all ${selectedEngine === engine.id
                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                    : engine.available
                                        ? 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                        : 'border-neutral-800 bg-neutral-900/50 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className={`flex justify-center mb-1 ${selectedEngine === engine.id ? 'text-emerald-400' : 'text-neutral-500'}`}>
                                    {engine.icon}
                                </div>
                                <p className="text-xs font-medium text-white">{engine.title}</p>
                                <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full ${engine.badgeColor}`}>
                                    {engine.badge}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-2 text-center">
                        {engines.find(e => e.id === selectedEngine)?.desc}
                    </p>
                </div>

                {/* API Key Validation Error */}
                {apiKeyError && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm mb-4 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4 flex-shrink-0" />
                            <span>{apiKeyError}</span>
                        </div>
                        {onOpenApiKeyModal && (
                            <button
                                onClick={onOpenApiKeyModal}
                                className="mt-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
                            >
                                ➕ {language === 'pt' ? 'Adicionar API Key' : language === 'es' ? 'Agregar API Key' : 'Add API Key'}
                            </button>
                        )}
                    </div>
                )}

                {/* Mode selection */}
                <div className="mb-4">
                    <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">
                        {language === 'pt' ? 'Cenário' : language === 'es' ? 'Escenario' : 'Scenario'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {modes.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => mode.available && setSelectedMode(mode.id)}
                                disabled={!mode.available}
                                className={`p-3 rounded-xl border text-left transition-all ${selectedMode === mode.id
                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                    : mode.available
                                        ? 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                        : 'border-neutral-800 bg-neutral-900/50 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={selectedMode === mode.id ? 'text-emerald-400' : 'text-neutral-500'}>
                                        {mode.icon}
                                    </div>
                                    <span className="text-sm font-medium text-white">{mode.title}</span>
                                </div>
                                <p className="text-[10px] text-neutral-400">{mode.desc}</p>
                                {!mode.available && mode.id === 'call' && (
                                    <div className="flex items-center gap-1 mt-1 text-[9px] text-amber-400">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        <span>Chrome/Edge</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Context status */}
                <div className="flex gap-2 mb-4 text-[10px] flex-wrap">
                    {selectedEngine !== 'browser' && (
                        <span className={`px-2 py-1 rounded-full ${hasValidKey ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>
                            🔑 {hasValidKey ? 'OpenAI' : (language === 'pt' ? 'Sem chave' : 'No key')}
                        </span>
                    )}
                    <span className={`px-2 py-1 rounded-full ${resumeData ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-500'}`}>
                        📎 {resumeData ? 'CV' : '-'}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${jobContext?.companyName ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-500'}`}>
                        🏢 {jobContext?.companyName || '-'}
                    </span>
                </div>

                {/* Warning */}
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-300 text-[10px] mb-4 border border-amber-500/20">
                    ⚠️ {language === 'pt'
                        ? 'Use com responsabilidade. Algumas empresas proíbem assistência externa.'
                        : language === 'es'
                            ? 'Usa con responsabilidad. Algunas empresas prohíben asistencia externa.'
                            : 'Use responsibly. Some companies prohibit external assistance.'}
                </div>

                {/* Start button */}
                <button
                    onClick={() => canStart && onStart(selectedMode, selectedEngine)}
                    disabled={!canStart}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${canStart
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                >
                    🎧 {language === 'pt' ? 'Iniciar' : language === 'es' ? 'Iniciar' : 'Start'}
                </button>
            </motion.div>
        </motion.div>
    );
}
