"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceOrb } from './VoiceOrb';
import { Button } from './ui/Button';
import {
    VoiceRecorder,
    VoiceSpeaker,
    VoiceState,
    VoiceError,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    AI_MODELS,
} from '@/lib/voice';
import { useAppStore, Provider } from '@/lib/store';
import {
    X,
    MessageSquare,
    Mic,
    Volume2,
    VolumeX,
    Settings2,
    ChevronDown,
    Sparkles,
    AlertCircle,
    Keyboard,
} from 'lucide-react';
import { clsx } from 'clsx';

interface VoiceChatProps {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (message: string) => void;
    lastAiMessage?: string;
    isAiResponding: boolean;
}

export function VoiceChat({
    isOpen,
    onClose,
    onSendMessage,
    lastAiMessage,
    isAiResponding,
}: VoiceChatProps) {
    const { language, t, getActiveKey, selectedModel, setSelectedModel, voiceSettings, setVoiceSettings } = useAppStore();
    const activeKey = getActiveKey();
    const provider = activeKey?.provider || 'openai';

    // Voice state
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<VoiceError | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [showModelSelector, setShowModelSelector] = useState(false);

    // Refs for voice instances
    const recorderRef = useRef<VoiceRecorder | null>(null);
    const speakerRef = useRef<VoiceSpeaker | null>(null);

    // Browser support
    const supportsRecognition = isSpeechRecognitionSupported();
    const supportsSynthesis = isSpeechSynthesisSupported();

    // Initialize voice instances
    useEffect(() => {
        if (isOpen && supportsRecognition) {
            recorderRef.current = new VoiceRecorder(language);
            recorderRef.current.onStateChange = (state) => {
                if (state === 'listening') setVoiceState('listening');
                else if (state === 'idle') setVoiceState('idle');
                else if (state === 'error') setVoiceState('error');
            };
            recorderRef.current.onResult = (text, isFinal) => {
                setTranscript(text);
                if (isFinal && text.trim()) {
                    handleSendVoiceMessage(text.trim());
                }
            };
            recorderRef.current.onAudioLevel = setAudioLevel;
            recorderRef.current.onError = setError;
        }

        if (isOpen && supportsSynthesis) {
            speakerRef.current = new VoiceSpeaker(language);
            speakerRef.current.onStateChange = setVoiceState;
            if (voiceSettings.speed) {
                speakerRef.current.setRate(voiceSettings.speed);
            }
        }

        return () => {
            recorderRef.current?.destroy();
            speakerRef.current?.stop();
        };
    }, [isOpen, language, supportsRecognition, supportsSynthesis, voiceSettings.speed]);

    // Speak AI response
    useEffect(() => {
        if (lastAiMessage && speakerRef.current && voiceSettings.autoSpeak && !isMuted && !isAiResponding) {
            speakerRef.current.speak(lastAiMessage);
        }
    }, [lastAiMessage, isAiResponding, voiceSettings.autoSpeak, isMuted]);

    // Send voice message
    const handleSendVoiceMessage = useCallback((message: string) => {
        setTranscript('');
        setVoiceState('processing');
        onSendMessage(message);
    }, [onSendMessage]);

    // Toggle recording
    const handleOrbClick = useCallback(() => {
        if (!supportsRecognition) {
            setError({ code: 'NOT_SUPPORTED', message: 'Speech recognition is not supported in this browser' });
            return;
        }

        if (voiceState === 'speaking') {
            speakerRef.current?.stop();
            return;
        }

        if (voiceState === 'listening') {
            recorderRef.current?.stop();
        } else {
            setError(null);
            setTranscript('');
            recorderRef.current?.start();
        }
    }, [voiceState, supportsRecognition]);

    // Toggle mute
    const handleMuteToggle = () => {
        if (isMuted) {
            setIsMuted(false);
        } else {
            speakerRef.current?.stop();
            setIsMuted(true);
        }
    };

    // Get models for current provider
    const availableModels = AI_MODELS[provider as keyof typeof AI_MODELS] || [];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl"
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-neutral-900" />
                        </div>
                        <div>
                            <span className="text-base font-semibold text-white">
                                Interview<span className="text-neutral-500">AI</span>
                            </span>
                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <Mic className="w-3 h-3" /> Voice Mode
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Model Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowModelSelector(!showModelSelector)}
                                className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
                            >
                                <Settings2 className="w-4 h-4" />
                                <span className="hidden md:inline">
                                    {availableModels.find(m => m.id === selectedModel)?.name || 'Select Model'}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                                {showModelSelector && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowModelSelector(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-full mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl p-2 shadow-xl z-50"
                                        >
                                            <p className="text-xs text-neutral-500 px-2 py-1 mb-1">
                                                {activeKey?.provider?.toUpperCase()} Models
                                            </p>
                                            {availableModels.map((model) => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => {
                                                        setSelectedModel(model.id);
                                                        setShowModelSelector(false);
                                                    }}
                                                    className={clsx(
                                                        "w-full flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors",
                                                        selectedModel === model.id
                                                            ? "bg-white/10 text-white"
                                                            : "text-neutral-300 hover:bg-neutral-800"
                                                    )}
                                                >
                                                    <span className="text-sm font-medium">{model.name}</span>
                                                    <span className="text-xs text-neutral-500">{model.description}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="h-full flex flex-col items-center justify-center px-4">
                    {/* Browser Support Warning */}
                    {!supportsRecognition && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 flex items-center gap-3 px-4 py-3 bg-amber-950/50 border border-amber-800 rounded-xl"
                        >
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <div>
                                <p className="text-sm text-amber-200">Voice not supported</p>
                                <p className="text-xs text-amber-400">
                                    Try Chrome or Edge for voice features
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-8 flex items-center gap-3 px-4 py-3 bg-red-950/50 border border-red-800 rounded-xl"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <div>
                                    <p className="text-sm text-red-200">{error.message}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-2 text-red-400 hover:text-red-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Voice Orb */}
                    <VoiceOrb
                        state={isAiResponding ? 'processing' : voiceState}
                        audioLevel={audioLevel}
                        onClick={handleOrbClick}
                        disabled={!supportsRecognition}
                        transcript={transcript}
                        size="lg"
                    />

                    {/* Last AI Message */}
                    {lastAiMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 max-w-lg text-center"
                        >
                            <p className="text-neutral-400 text-sm line-clamp-3">
                                {lastAiMessage.length > 150
                                    ? lastAiMessage.substring(0, 150) + '...'
                                    : lastAiMessage
                                }
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-center gap-3">
                        {/* Mute Toggle */}
                        <button
                            onClick={handleMuteToggle}
                            className={clsx(
                                "p-3 rounded-xl border transition-colors",
                                isMuted
                                    ? "bg-red-950/50 border-red-800 text-red-400"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                            )}
                            title={isMuted ? "Unmute AI" : "Mute AI"}
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        {/* Switch to Text Mode */}
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Keyboard className="w-4 h-4" />
                            <span>Switch to Text</span>
                        </Button>

                        {/* Auto-speak Toggle */}
                        <button
                            onClick={() => setVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })}
                            className={clsx(
                                "p-3 rounded-xl border transition-colors",
                                voiceSettings.autoSpeak
                                    ? "bg-emerald-950/50 border-emerald-800 text-emerald-400"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                            )}
                            title={voiceSettings.autoSpeak ? "Auto-speak on" : "Auto-speak off"}
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-center text-xs text-neutral-600 mt-3">
                        {voiceState === 'idle' && "Tap the orb to start speaking"}
                        {voiceState === 'listening' && "Speak now... Tap to stop"}
                        {voiceState === 'speaking' && "AI is speaking... Tap to stop"}
                        {voiceState === 'processing' && "Processing your response..."}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
