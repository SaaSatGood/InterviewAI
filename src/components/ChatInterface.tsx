"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Send, User, Bot, Loader2, AlertCircle, LogOut, Sparkles, Clock, MessageSquare, Mic, MicOff, Copy, Check, RotateCcw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '@/hooks/useInterview';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import { InterviewTimer } from './InterviewTimer';
import { clsx } from 'clsx';

interface ChatInterfaceProps {
    onOpenSettings: () => void;
}

export function ChatInterface({ onOpenSettings }: ChatInterfaceProps) {
    const { messages, isLoading, error, sendMessage, finishInterview } = useInterview();
    const { resetSession, t, userProfile } = useAppStore();
    const [input, setInput] = useState('');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);

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
        <div className="flex flex-col h-screen bg-neutral-950">
            {/* Header */}
            <header className="flex items-center justify-between py-3 px-4 md:px-6 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
                        <Sparkles className="w-5 h-5 text-neutral-900" />
                    </div>
                    <div>
                        <span className="text-base font-semibold text-white">Interview<span className="text-neutral-500">AI</span></span>
                        <p className="text-xs text-neutral-500 hidden md:flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" />
                            {questionsAsked} questions · {userResponses} responses
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <InterviewTimer />

                    {/* Settings Button */}
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                        title="Manage API Keys"
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEndConfirm(true)}
                            disabled={isFinishing || messages.length < 4}
                            className="border-neutral-700"
                        >
                            {isFinishing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                    <span className="hidden md:inline">{t('chat.generating')}</span>
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4 md:mr-1.5" />
                                    <span className="hidden md:inline">{t('chat.endInterview')}</span>
                                </>
                            )}
                        </Button>

                        {/* End Interview Confirmation Popup */}
                        <AnimatePresence>
                            {showEndConfirm && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowEndConfirm(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                        className="absolute right-0 top-full mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl z-50"
                                    >
                                        <p className="text-sm text-neutral-200 mb-3">
                                            {t('chat.endConfirmTitle') || 'End this interview?'}
                                        </p>
                                        <p className="text-xs text-neutral-500 mb-4">
                                            {t('chat.endConfirmDesc') || 'Your performance report will be generated based on your responses.'}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setShowEndConfirm(false)} className="flex-1">
                                                Cancel
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={handleFinish} className="flex-1">
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-3xl w-full px-4 pt-4"
                >
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-3 text-center">
                        <p className="text-xs text-neutral-500">
                            {t('chat.interviewingFor') || 'Interviewing for'}{' '}
                            <span className="text-neutral-300 font-medium">{userProfile.level}</span>{' '}
                            <span className="text-neutral-200">{userProfile.position}</span>{' '}
                            <span className="text-neutral-500">·</span>{' '}
                            <span className="text-neutral-400">{userProfile.stacks.slice(0, 3).join(', ')}{userProfile.stacks.length > 3 ? ` +${userProfile.stacks.length - 3}` : ''}</span>
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className={clsx(
                                    "flex gap-3 group",
                                    msg.role === 'user' ? 'flex-row-reverse' : ''
                                )}
                            >
                                {/* Avatar */}
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className={clsx(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                                        msg.role === 'assistant'
                                            ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400 border border-neutral-700'
                                            : 'bg-white text-neutral-900'
                                    )}
                                >
                                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </motion.div>

                                {/* Message Bubble */}
                                <div className={clsx(
                                    "relative px-4 py-3 rounded-2xl max-w-[85%] shadow-sm",
                                    msg.role === 'assistant'
                                        ? 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-md'
                                        : 'bg-white text-neutral-900 rounded-tr-md'
                                )}>
                                    {/* Copy button for assistant messages */}
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => handleCopy(msg.content, idx)}
                                            className="absolute -top-2 -right-2 p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white hover:bg-neutral-700"
                                            title="Copy"
                                        >
                                            {copiedIdx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    )}

                                    <div className={clsx(
                                        "prose prose-sm max-w-none",
                                        msg.role === 'assistant'
                                            ? 'prose-invert prose-p:text-neutral-200 prose-strong:text-white prose-code:text-neutral-300 prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none'
                                            : 'prose-neutral',
                                        'prose-p:my-1 prose-pre:my-2 prose-pre:bg-neutral-800 prose-pre:border prose-pre:border-neutral-700 prose-pre:rounded-lg prose-ul:my-2 prose-li:my-0.5'
                                    )}>
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        ) : (
                                            <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                                        )}
                                    </div>

                                    {/* Timestamp for assistant */}
                                    {msg.role === 'assistant' && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-600">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                className="flex gap-3"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400 flex items-center justify-center border border-neutral-700">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="flex items-center bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-2xl rounded-tl-md">
                                    <div className="flex gap-1.5 mr-3">
                                        {[0, 1, 2].map(i => (
                                            <motion.span
                                                key={i}
                                                className="w-2 h-2 bg-neutral-500 rounded-full"
                                                animate={{ y: [0, -6, 0] }}
                                                transition={{
                                                    duration: 0.6,
                                                    repeat: Infinity,
                                                    delay: i * 0.15,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-neutral-500">{t('chat.thinking')}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-center p-4"
                            >
                                <div className="bg-red-950/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm border border-red-900/50">
                                    <AlertCircle className="w-5 h-5" />
                                    <div>
                                        <p className="font-medium">Something went wrong</p>
                                        <p className="text-red-500 text-xs">{error}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => window.location.reload()} className="ml-2">
                                        <RotateCcw className="w-3 h-3 mr-1" /> Retry
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('chat.placeholder') || "Type your answer..."}
                                className="w-full min-h-[48px] max-h-[150px] px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-neutral-700 disabled:opacity-50 resize-none transition-all"
                                disabled={isLoading}
                                autoFocus
                                rows={1}
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-neutral-600">
                                {input.length > 0 && `${input.length} chars`}
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="h-12 w-12 p-0 rounded-xl"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    </div>
                    <p className="text-[10px] text-neutral-600 mt-2 text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400 font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400 font-mono">Shift+Enter</kbd> for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
