'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface IntelPanelProps {
    isSpeaking: boolean;
    micVolume: number;
}

export function IntelPanel({ isSpeaking, micVolume }: IntelPanelProps) {
    const { t } = useAppStore();

    const [insight, setInsight] = useState<{ title: string; desc: string } | null>(null);

    useEffect(() => {
        // Demo: show an insight card after 5 seconds to showcase the UI
        const timer = setTimeout(() => {
            setInsight({
                title: t('coach.objectionDetected'),
                desc: '"This is too expensive"',
            });
        }, 5000);
        return () => clearTimeout(timer);
    }, [t]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-8 overflow-hidden">
            {/* Ambient Background Pulse */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.08, 0.18, 0.08],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"
                />
            </div>

            {/* Central Status */}
            <div className="relative z-10 text-center mb-12">
                <motion.div
                    key={isSpeaking ? 'speaking' : 'listening'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isSpeaking ? t('coach.prospectSpeaking') : t('coach.listeningTo')}
                    </h2>
                    <p className="text-neutral-400 max-w-md mx-auto text-sm">
                        {isSpeaking
                            ? 'Analyzing sentiment and keywords...'
                            : t('coach.detecting')}
                    </p>
                </motion.div>

                {/* Waveform Visualization */}
                <div className="h-32 flex items-center justify-center gap-1.5 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`w-1.5 rounded-full ${isSpeaking
                                    ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]'
                                    : 'bg-neutral-800'
                                }`}
                            animate={{
                                height: isSpeaking
                                    ? Math.max(10, Math.random() * 100 * (micVolume * 5))
                                    : [10, 15, 10],
                            }}
                            transition={{
                                duration: isSpeaking ? 0.1 : 2,
                                repeat: isSpeaking ? 0 : Infinity,
                                ease: isSpeaking ? 'linear' : 'easeInOut',
                                delay: isSpeaking ? 0 : i * 0.05,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Floating Insight Card */}
            <AnimatePresence>
                {insight && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-8 z-20 w-full max-w-lg px-4"
                    >
                        <div className="bg-neutral-900/90 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-2xl ring-1 ring-amber-500/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">
                                        ⚡ {insight.title}
                                    </h3>
                                    <p className="text-xl font-bold text-white">{insight.desc}</p>
                                </div>
                            </div>

                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-white/5 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-400 uppercase">
                                        {t('coach.suggestedResponse')}
                                    </span>
                                </div>
                                <p className="text-neutral-300 italic text-sm leading-relaxed">
                                    &quot;Totally fair — most clients felt the same before realizing the ROI in 30 days.&quot;
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-2 bg-white text-neutral-950 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors">
                                    Use Response
                                </button>
                                <button
                                    onClick={() => setInsight(null)}
                                    className="flex-1 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors"
                                >
                                    {t('coach.rephrase')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Speaking Tags */}
            <div className="absolute top-8 right-8 flex flex-col gap-2 items-end z-10">
                <AnimatePresence>
                    {isSpeaking && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold"
                            >
                                Objection Risk ↑
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: 0.2 }}
                                className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold"
                            >
                                Price Sensitivity
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
