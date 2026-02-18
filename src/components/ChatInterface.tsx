"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Send, User, Bot, Loader2, AlertCircle, LogOut, Sparkles, Clock, MessageSquare, Mic, MicOff, Copy, Check, RotateCcw, Settings, ChevronDown, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '@/hooks/useInterview';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import { InterviewTimer } from './InterviewTimer';
import { clsx } from 'clsx';
import { VoiceChat } from './VoiceChat';
import { AI_MODELS, isSpeechRecognitionSupported } from '@/lib/voice';

interface ChatInterfaceProps {
    onOpenSettings: () => void;
}

export function ChatInterface({ onOpenSettings }: ChatInterfaceProps) {
    const { messages, isLoading, error, sendMessage, finishInterview } = useInterview();
    const { resetSession, t, userProfile, voiceEnabled, setVoiceEnabled, selectedModel, setSelectedModel, getActiveKey } = useAppStore();
    const [input, setInput] = useState('');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showModelSelector, setShowModelSelector] = useState(false);

    const activeKey = getActiveKey();
    const provider = activeKey?.provider || 'openai';
    const availableModels = AI_MODELS[provider as keyof typeof AI_MODELS] || [];
    const supportsVoice = isSpeechRecognitionSupported();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput('');
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSkip = () => {
        if (isLoading) return;
        sendMessage("I would like to skip this question. Please provide the answer and move to the next one.");
    };

    const handleFinish = async () => {
        setShowEndConfirm(false);
        setIsFinishing(true);
        await finishInterview();
        setIsFinishing(false);
    };

    const handleCopy = async (text: string, idx: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const questionsAsked = messages.filter(m => m.role === 'assistant').length;
    const userResponses = messages.filter(m => m.role === 'user').length;

    return (
        <div className="flex flex-col h-screen bg-neutral-950 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-900/20 via-neutral-950 to-neutral-950 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-neutral-950/80 to-transparent pointer-events-none z-10"></div>

            {/* Header */}
            <header className="flex items-center justify-between py-4 px-6 border-b border-white/5 bg-neutral-900/60 backdrop-blur-xl z-20 sticky top-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_15px_-5px_rgba(255,255,255,0.4)]">
                        <Sparkles className="w-5 h-5 text-neutral-900" />
                    </div>
                    <div>
                        <span className="text-lg font-semibold text-white tracking-tight">Interview<span className="text-neutral-500">AI</span></span>
                        <p className="text-xs text-neutral-400 hidden md:flex items-center gap-2">
                            <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-neutral-400" /> {questionsAsked} {t('chat.questions')}</span>
                            <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-neutral-400" /> {userResponses} {t('chat.responses')}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-neutral-800/50 rounded-lg px-3 py-1.5 border border-white/5">
                        <InterviewTimer />
                    </div>

                    {/* Model Selector */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setShowModelSelector(!showModelSelector)}
                            aria-label={t('voice.selectModel')}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-neutral-300 transition-all hover:scale-105"
                        >
                            <span className="max-w-[100px] truncate font-medium">
                                {availableModels.find(m => m.id === selectedModel)?.name || t('voice.selectModel')}
                            </span>
                            <ChevronDown className="w-3 h-3 text-neutral-500" />
                        </button>
                        <AnimatePresence>
                            {showModelSelector && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowModelSelector(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-64 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl z-50"
                                    >
                                        <p className="text-[10px] uppercase font-bold text-neutral-500 px-3 py-2 tracking-wider">
                                            {provider} Models
                                        </p>
                                        {availableModels.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model.id);
                                                    setShowModelSelector(false);
                                                }}
                                                className={clsx(
                                                    "w-full flex flex-col items-start px-3 py-2.5 rounded-lg text-left transition-colors",
                                                    selectedModel === model.id
                                                        ? "bg-white/10 text-white"
                                                        : "text-neutral-300 hover:bg-white/5"
                                                )}
                                            >
                                                <span className="text-sm font-medium">{model.name}</span>
                                                <span className="text-xs text-neutral-500 mt-0.5">{model.description}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Voice Mode Toggle */}
                    {supportsVoice && (
                        <button
                            onClick={() => setVoiceEnabled(true)}
                            aria-label={t('voice.modeVoice')}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all hover:scale-105 hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)]"
                            title={t('voice.modeVoice')}
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    )}

                    {/* Settings Button */}
                    <button
                        onClick={onOpenSettings}
                        aria-label={t('coach.manageKeys')}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all hover:scale-105"
                        title={t('coach.manageKeys')}
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEndConfirm(true)}
                            disabled={isFinishing || messages.length < 4}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-10 px-4 rounded-xl"
                        >
                            {isFinishing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    <span className="hidden md:inline">{t('chat.generating')}</span>
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">{t('chat.endInterview')}</span>
                                </>
                            )}
                        </Button>

                        {/* End Interview Confirmation Popup */}
                        <AnimatePresence>
                            {showEndConfirm && (
                                <>
                                    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowEndConfirm(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl z-50 ring-1 ring-white/10"
                                    >
                                        <h4 className="text-base font-semibold text-white mb-2">
                                            {t('chat.endConfirmTitle') || 'Finish Interview?'}
                                        </h4>
                                        <p className="text-sm text-neutral-400 mb-5 leading-relaxed">
                                            {t('chat.endConfirmDesc') || 'We will generate a detailed feedback report based on your responses. This cannot be undone.'}
                                        </p>
                                        <div className="flex gap-3">
                                            <Button size="sm" variant="ghost" onClick={() => setShowEndConfirm(false)} className="flex-1 text-neutral-400 hover:text-white">
                                                Cancel
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={handleFinish} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 border-0 shadow-lg shadow-red-500/20">
                                                End Interview
                                            </Button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Interview Context Banner */}
            {userProfile && messages.length <= 2 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 mx-auto max-w-2xl w-full px-4 pt-6"
                >
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-3 px-6 text-center shadow-xl">
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1.5">Interview Context</p>
                        <p className="text-sm text-neutral-200">
                            <span className="text-white font-semibold">{userProfile.level}</span>{' '}
                            <span className="text-white font-bold">{userProfile.position}</span>
                            <span className="mx-2 text-neutral-600">|</span>
                            <span className="text-neutral-300">{(userProfile.stacks || []).slice(0, 3).join(', ')}{(userProfile.stacks || []).length > 3 ? ` +${(userProfile.stacks || []).length - 3}` : ''}</span>
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={clsx(
                                    "flex gap-4 group",
                                    msg.role === 'user' ? 'flex-row-reverse' : ''
                                )}
                            >
                                {/* Avatar */}
                                <div className="shrink-0 pt-1">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
                                        msg.role === 'assistant'
                                            ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 text-white'
                                            : 'bg-gradient-to-br from-white to-neutral-200 text-neutral-900'
                                    )}>
                                        {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                </div>

                                {/* Message Bubble */}
                                <div className={clsx(
                                    "relative px-6 py-4 rounded-3xl max-w-[85%] shadow-md",
                                    msg.role === 'assistant'
                                        ? 'bg-neutral-900/80 backdrop-blur-sm border border-white/5 text-neutral-200 rounded-tl-sm'
                                        : 'bg-white text-neutral-900 rounded-tr-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]'
                                )}>
                                    {/* Copy button for assistant messages */}
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => handleCopy(msg.content, idx)}
                                            className="absolute -top-3 -right-3 p-2 bg-neutral-800 border border-neutral-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-neutral-400 hover:text-white hover:bg-neutral-700 shadow-lg scale-90 hover:scale-100"
                                            title="Copy"
                                        >
                                            {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    )}

                                    <div className={clsx(
                                        "prose prose-sm max-w-none leading-relaxed",
                                        msg.role === 'assistant'
                                            ? 'prose-invert prose-p:text-neutral-300 prose-headings:text-white prose-strong:text-white prose-code:text-neutral-200 prose-code:bg-neutral-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-white/10'
                                            : 'prose-neutral prose-p:text-neutral-800'
                                    )}>
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        ) : (
                                            <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                                        )}
                                    </div>

                                    {/* Timestamp for assistant */}
                                    {msg.role === 'assistant' && (
                                        <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-neutral-600">
                                            <Clock className="w-3 h-3" />
                                            {msg.timestamp
                                                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            }
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex gap-4"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 text-neutral-400 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="flex items-center bg-neutral-900/50 border border-white/5 px-5 py-4 rounded-3xl rounded-tl-sm backdrop-blur-sm">
                                    <div className="flex gap-1.5 mr-3">
                                        {[0, 1, 2].map(i => (
                                            <motion.span
                                                key={i}
                                                className="w-2 h-2 bg-white rounded-full"
                                                animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    delay: i * 0.15,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-400">{t('chat.thinking')}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex justify-center"
                            >
                                <div className="bg-red-500/10 backdrop-blur-md text-red-400 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm border border-red-500/20 shadow-xl max-w-md">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-red-300">Connection Error</p>
                                        <p className="text-red-400/80 text-xs mt-0.5 leading-snug">{error}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => window.location.reload()} className="hover:bg-red-500/20 text-red-300">
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-neutral-950/80 backdrop-blur-xl relative z-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-neutral-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className="bg-neutral-900 rounded-2xl border border-white/10 relative flex items-end overflow-hidden shadow-xl transition-colors group-focus-within:border-white/20">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('chat.placeholder') || "Type your answer..."}
                                className="w-full min-h-[60px] max-h-[200px] px-5 py-4 bg-transparent text-neutral-100 text-base placeholder:text-neutral-600 focus:outline-none resize-none"
                                disabled={isLoading}
                                autoFocus
                                rows={1}
                            />
                            <div className="p-2 pb-3 pr-3">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        aria-label={t('chat.send')}
                                        className={clsx(
                                            "h-10 w-10 p-0 rounded-xl transition-all",
                                            input.trim()
                                                ? "bg-white text-neutral-900 hover:bg-neutral-200 shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)]"
                                                : "bg-neutral-800 text-neutral-500"
                                        )}
                                    >
                                        <Send className="w-5 h-5 ml-0.5" />
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 px-1">
                        <button
                            onClick={handleSkip}
                            disabled={isLoading}
                            className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                            <SkipForward className="w-3.5 h-3.5" />
                            {t('chat.skipQuestion')}
                        </button>

                        <div className="flex gap-4 text-[10px] font-medium text-neutral-600 uppercase tracking-widest hidden sm:flex">
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded-md border border-white/5 text-neutral-400 font-sans">Enter</kbd> Send
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded-md border border-white/5 text-neutral-400 font-sans">Shift+Enter</kbd> New Line
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voice Chat Overlay */}
            <VoiceChat
                isOpen={voiceEnabled}
                onClose={() => setVoiceEnabled(false)}
                onSendMessage={sendMessage}
                lastAiMessage={messages.filter(m => m.role === 'assistant').pop()?.content}
                isAiResponding={isLoading}
            />
        </div>
    );
}
