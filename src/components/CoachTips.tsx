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

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; gradient: string }> = {
    technical: { icon: '🔧', label: 'Technical', color: 'text-cyan-400', gradient: 'from-cyan-500/10' },
    behavioral: { icon: '🧠', label: 'Behavioral', color: 'text-purple-400', gradient: 'from-purple-500/10' },
    system_design: { icon: '📊', label: 'System Design', color: 'text-amber-400', gradient: 'from-amber-500/10' },
    experience: { icon: '💼', label: 'Experience', color: 'text-emerald-400', gradient: 'from-emerald-500/10' },
    silence_tip: { icon: '💡', label: 'Tip', color: 'text-yellow-400', gradient: 'from-yellow-500/10' },

    // Sales categories
    discovery: { icon: '🤝', label: 'Discovery', color: 'text-indigo-400', gradient: 'from-indigo-500/10' },
    objection: { icon: '🎯', label: 'Objection', color: 'text-red-300', gradient: 'from-red-500/20 shadow-red-500/10' },
    closing: { icon: '💼', label: 'Closing', color: 'text-emerald-400', gradient: 'from-emerald-500/20 shadow-emerald-500/10' },
    value_prop: { icon: '📊', label: 'Value Prop', color: 'text-amber-400', gradient: 'from-amber-500/10' },

    // Support categories
    resolution: { icon: '✅', label: 'Resolution', color: 'text-emerald-400', gradient: 'from-emerald-500/10' },
    empathy: { icon: '❤️', label: 'Empathy', color: 'text-pink-400', gradient: 'from-pink-500/10' },
    escalation: { icon: '⚠️', label: 'Escalation', color: 'text-orange-400', gradient: 'from-orange-500/20' },
    knowledge: { icon: '📚', label: 'Knowledge', color: 'text-blue-400', gradient: 'from-blue-500/10' },
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.03] backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">AI Intelligence</span>
                    <span className="flex h-1 w-1 rounded-full bg-indigo-500" />
                </div>
                {isAnalyzing && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-indigo-400 font-bold animate-pulse uppercase tracking-tighter">Analyzing deal...</span>
                    </div>
                )}
            </div>

            {/* Error banner */}
            {error && (
                <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-indigo-500/5 shadow-2xl">
                        <span className="text-2xl">🧠</span>
                    </div>
                    <div>
                        <p className="text-neutral-300 font-bold text-sm tracking-tight">Intelligence Standby</p>
                        <p className="text-neutral-500 text-xs mt-1.5 max-w-[240px]">The AI is monitoring the deal context in real-time. Dicas de fechamento e contorno de objeções aparecerão aqui.</p>
                    </div>
                </div>

                <AnimatePresence>
                    {tips.map((tip, idx) => {
                        const config = TYPE_CONFIG[tip.type] || TYPE_CONFIG.technical;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                className={`p-5 rounded-2xl bg-gradient-to-br ${config.gradient} to-transparent border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden group`}
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-4xl grayscale leading-none">{config.icon}</span>
                                </div>
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
                                <ul className="space-y-3 relative z-10">
                                    {tip.tips.map((t, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            </div>
                                            <span className="text-sm text-neutral-100 font-medium leading-relaxed">{t}</span>
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
