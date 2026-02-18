'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CoachTip } from '@/lib/prompts-coach';

// Map tip types to visual categories
const POSITIVE_TYPES = ['strength', 'resolution', 'empathy', 'value_prop', 'discovery', 'closing'];
const WARNING_TYPES = ['weakness', 'objection', 'escalation', 'warning'];
// Everything else = info (blue)

function getTipStyle(type: string) {
    if (POSITIVE_TYPES.includes(type)) return {
        bg: 'bg-white/5 border-white/10',
        icon: 'bg-white/10 text-white',
        Icon: CheckCircle2,
    };
    if (WARNING_TYPES.includes(type)) return {
        bg: 'bg-white/5 border-white/10',
        icon: 'bg-white/10 text-white',
        Icon: AlertTriangle,
    };
    return {
        bg: 'bg-white/5 border-white/10',
        icon: 'bg-white/10 text-white',
        Icon: Lightbulb,
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
        <div className="h-full flex flex-col bg-neutral-900 border-l border-white/5">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-neutral-900 z-10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    {t('coach.aiInsights') || "Insights do Coach"}
                </h2>
                {isAnalyzing && (
                    <span className="text-sm text-neutral-300 animate-pulse flex items-center gap-1.5 mt-3">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Analisando contexto em tempo real...
                    </span>
                )}
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                <AnimatePresence mode="popLayout">
                    {tips.length === 0 && !isAnalyzing && (
                        <div className="text-center py-16 opacity-40">
                            <Lightbulb className="w-10 h-10 text-neutral-600 mx-auto mb-4" />
                            <p className="text-sm text-neutral-500 max-w-[200px] mx-auto">
                                {t('coach.waitingForInsights') || "Fale algo para receber insights em tempo real..."}
                            </p>
                        </div>
                    )}

                    {tips.map((tip) => {
                        const style = getTipStyle(tip.type);
                        return (
                            <motion.div
                                key={tip.timestamp}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                layout
                                className={`p-4 rounded-xl border relative overflow-hidden ${style.bg}`}
                            >
                                {/* Type badge */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${style.icon}`}>
                                        <style.Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                                        {tip.type.replace('_', ' ')}
                                    </span>
                                    <span className="ml-auto text-[11px] text-neutral-500 tabular-nums">
                                        {new Date(tip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>

                                {/* Tips List — THIS WAS THE BUG: was using tip.content instead of tip.tips */}
                                <ul className="space-y-2">
                                    {tip.tips.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-200 leading-relaxed">
                                            <span className="text-white mt-0.5 shrink-0">•</span>
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Keywords */}
                                {tip.keywords && tip.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {tip.keywords.map((kw, i) => (
                                            <span key={i} className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-neutral-300 border border-white/5 font-medium">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Method badge */}
                                {tip.method && (
                                    <div className="mt-3 flex items-center gap-1">
                                        <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/10 text-white border border-white/20 font-bold uppercase tracking-wider">
                                            {tip.method}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
