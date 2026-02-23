'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, CheckCircle2, Sparkles, MessageSquareQuote } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CoachTip } from '@/lib/prompts-coach';

// Map tip types to visual categories (Simplified)
const POSITIVE_TYPES = ['strength', 'resolution', 'empathy', 'value_prop', 'discovery', 'closing'];
const WARNING_TYPES = ['weakness', 'objection', 'escalation', 'warning'];

function getTipStyle(type: string) {
    if (POSITIVE_TYPES.includes(type)) return {
        bg: 'bg-gradient-to-br from-emerald-950/40 to-emerald-900/10 border-emerald-500/20 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/10',
        icon: 'bg-emerald-500/20 text-emerald-400',
        Icon: CheckCircle2,
        label: 'Oportunidade'
    };
    if (WARNING_TYPES.includes(type)) return {
        bg: 'bg-gradient-to-br from-amber-950/40 to-amber-900/10 border-amber-500/20 shadow-[0_8px_30px_-4px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/10',
        icon: 'bg-amber-500/20 text-amber-400',
        Icon: AlertTriangle,
        label: 'Atenção'
    };
    return {
        bg: 'bg-gradient-to-br from-indigo-950/40 to-indigo-900/10 border-indigo-500/20 shadow-[0_8px_30px_-4px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/10',
        icon: 'bg-indigo-500/20 text-indigo-400',
        Icon: Lightbulb,
        label: 'Dica'
    };
}

interface CoachFeedProps {
    tips: CoachTip[];
    isAnalyzing: boolean;
}

export function CoachFeed({ tips, isAnalyzing }: CoachFeedProps) {
    const { t } = useAppStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to newest tip
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [tips]);

    return (
        <div className="h-full flex flex-col bg-black">
            {/* Minimalist Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-neutral-950 z-10 shrink-0 shadow-md">
                <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-white" />
                        {t('coach.aiInsights') || "AI Co-Pilot"}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1 font-medium">Inteligência Estratégica em Tempo Real</p>
                </div>
                {isAnalyzing && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Analisando</span>
                    </div>
                )}
            </div>

            {/* Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent" ref={scrollRef}>
                <AnimatePresence mode="popLayout">
                    {tips.length === 0 && !isAnalyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="p-6 rounded-full bg-white/5 border border-white/10 mb-6 relative"
                            >
                                <motion.div
                                    animate={{
                                        boxShadow: [
                                            "0 0 0px 0px rgba(255,255,255,0)",
                                            "0 0 20px 10px rgba(255,255,255,0.05)",
                                            "0 0 0px 0px rgba(255,255,255,0)"
                                        ]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 rounded-full"
                                />
                                <MessageSquareQuote className="w-12 h-12 text-neutral-400 relative z-10" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Escutando...</h3>
                            <p className="text-sm text-neutral-400 max-w-xs font-medium leading-relaxed">
                                {t('coach.waitingForInsights') || "Insights estratégicos aparecerão aqui automaticamente durante a conversa."}
                            </p>
                        </div>
                    )}

                    {tips.map((tip) => {
                        const style = getTipStyle(tip.type);
                        return (
                            <motion.div
                                key={tip.timestamp}
                                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`p-6 md:p-8 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-md ${style.bg}`}
                            >
                                {/* Type badge & Timestamp */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${style.icon}`}>
                                            <style.Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-300">
                                                {style.label}
                                            </h3>
                                            {tip.method && (
                                                <p className="text-xs text-neutral-500 font-medium">{tip.method}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-neutral-500 bg-black/20 px-3 py-1 rounded-lg">
                                        {new Date(tip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* Tips List — Big Typography with Staggered Animation */}
                                <motion.ul
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.15,
                                            },
                                        },
                                    }}
                                    className="space-y-4"
                                >
                                    {tip.tips.map((t, i) => (
                                        <motion.li
                                            key={i}
                                            variants={{
                                                hidden: { opacity: 0, x: -10 },
                                                visible: { opacity: 1, x: 0 },
                                            }}
                                            className="flex items-start gap-4"
                                        >
                                            <span className="text-white text-xl md:text-2xl mt-1 opacity-50 shrink-0 border border-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white/5">
                                                {i + 1}
                                            </span>
                                            <span className="text-white text-xl md:text-2xl font-medium leading-snug tracking-tight">
                                                {t}
                                            </span>
                                        </motion.li>
                                    ))}
                                </motion.ul>

                                {/* Keywords */}
                                {tip.keywords && tip.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/5">
                                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-2 self-center">Foque em:</span>
                                        {tip.keywords.map((kw, i) => (
                                            <span key={i} className="text-sm px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold tracking-wide">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Skeleton Loader during analysis */}
                {isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-3 w-24 bg-white/10 rounded-full animate-pulse" />
                                <div className="h-2 w-16 bg-white/5 rounded-full animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Analisando...</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-5 w-full bg-white/5 rounded-lg animate-pulse" />
                            <div className="h-5 w-4/5 bg-white/5 rounded-lg animate-pulse" />
                            <div className="h-5 w-3/5 bg-white/5 rounded-lg animate-pulse" />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
