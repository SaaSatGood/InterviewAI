'use client';

// CoachTips — AI coaching suggestions panel with animations
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoachTip } from '@/lib/prompts-coach';

interface CoachTipsProps {
    tips: CoachTip[];
    isAnalyzing: boolean;
    error?: string | null;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
    technical: { icon: '🔧', label: 'Technical', color: 'text-cyan-400' },
    behavioral: { icon: '🧠', label: 'Behavioral', color: 'text-purple-400' },
    system_design: { icon: '📊', label: 'System Design', color: 'text-amber-400' },
    experience: { icon: '💼', label: 'Experience', color: 'text-emerald-400' },
    silence_tip: { icon: '💡', label: 'Tip', color: 'text-yellow-400' },
};

const METHOD_BADGE: Record<string, { label: string; color: string }> = {
    STAR: { label: 'Use STAR Method', color: 'bg-purple-500/20 text-purple-300' },
    'trade-off': { label: 'Discuss Trade-offs', color: 'bg-amber-500/20 text-amber-300' },
    example: { label: 'Give Example', color: 'bg-emerald-500/20 text-emerald-300' },
};

export function CoachTips({ tips, isAnalyzing, error }: CoachTipsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [tips]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                <span className="text-sm font-medium text-neutral-300">💡 AI Coach</span>
                {isAnalyzing && (
                    <span className="text-xs text-yellow-400 animate-pulse">analisando...</span>
                )}
            </div>

            {/* Error banner */}
            {error && (
                <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {tips.length === 0 && !isAnalyzing && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-neutral-500 text-sm text-center">
                            Tips will appear here<br />
                            <span className="text-xs text-neutral-600">when the interviewer asks a question</span>
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    {tips.map((tip, idx) => {
                        const config = TYPE_CONFIG[tip.type] || TYPE_CONFIG.technical;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 rounded-xl bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 border border-neutral-700/50 shadow-lg"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{config.icon}</span>
                                        <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    {tip.method && METHOD_BADGE[tip.method] && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${METHOD_BADGE[tip.method].color}`}>
                                            {METHOD_BADGE[tip.method].label}
                                        </span>
                                    )}
                                </div>

                                {/* Question context */}
                                {tip.questionText && (
                                    <p className="text-xs text-neutral-500 mb-2 italic truncate">
                                        &quot;{tip.questionText}&quot;
                                    </p>
                                )}

                                {/* Tips */}
                                <ul className="space-y-2">
                                    {tip.tips.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-emerald-400 mt-0.5 text-xs">✅</span>
                                            <span className="text-sm text-neutral-200">{t}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Keywords */}
                                {tip.keywords && tip.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {tip.keywords.map((kw, i) => (
                                            <span
                                                key={i}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-300 font-medium"
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Analyzing skeleton */}
                {isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/30"
                    >
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-neutral-700/50 rounded animate-pulse" />
                            <div className="h-3 w-full bg-neutral-700/30 rounded animate-pulse" />
                            <div className="h-3 w-3/4 bg-neutral-700/30 rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-neutral-700/30 rounded animate-pulse" />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
