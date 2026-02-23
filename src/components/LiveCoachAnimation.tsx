'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, ShieldAlert, BarChart3, Mic, TrendingUp, Sparkles, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Phase = 'listening' | 'transcribing' | 'processing' | 'suggesting';

export function LiveCoachAnimation() {
    const [mounted, setMounted] = useState(false);
    const [phase, setPhase] = useState<Phase>('listening');

    useEffect(() => {
        setMounted(true);

        let isSubscribed = true;

        const runSequence = async () => {
            while (isSubscribed) {
                // 1. Listening
                setPhase('listening');
                await new Promise(r => setTimeout(r, 2500));
                if (!isSubscribed) break;

                // 2. Transcribing
                setPhase('transcribing');
                await new Promise(r => setTimeout(r, 2000));
                if (!isSubscribed) break;

                // 3. Processing
                setPhase('processing');
                await new Promise(r => setTimeout(r, 2500));
                if (!isSubscribed) break;

                // 4. Suggesting
                setPhase('suggesting');
                await new Promise(r => setTimeout(r, 4500));
            }
        };

        runSequence();

        return () => { isSubscribed = false; };
    }, []);

    if (!mounted) return <div className="w-full aspect-[4/3] min-h-[400px]" />;

    return (
        <div className="relative w-full max-w-[900px] h-[500px] mx-auto flex items-center justify-center select-none perspective-1000 mt-16 mb-12">

            {/* Background Glow */}
            <div className="absolute inset-0 bg-neutral-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Dashboard Container */}
            <motion.div
                className="relative w-full h-full bg-neutral-950/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl z-10 ring-1 ring-white/5"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Header Navbar */}
                <div className="h-14 border-b border-white/5 flex items-center px-6 justify-between bg-white/[0.01]">
                    <div className="flex gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DE9F34]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-neutral-900 rounded-md border border-white/5 overflow-hidden">
                            <div className="px-3 py-1.5 text-xs text-neutral-400 border-r border-white/5 bg-white/5 flex items-center gap-1.5">
                                <Mic className="w-3 h-3 text-white" /> Capturando audio
                            </div>
                            <div className="px-3 py-1.5 text-xs text-white font-mono flex items-center gap-2">
                                <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-red-500"
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                00:04:12
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Split View */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                    {/* Left Panel: Audio & Transcript (45%) */}
                    <div className="flex-1 md:flex-[0.5] relative bg-neutral-950/50 flex flex-col z-10 border-r border-white/5">

                        {/* Audio Visualizer Area */}
                        <div className="h-32 p-6 border-b border-white/5 bg-gradient-to-b from-transparent to-neutral-900/50 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:16px_16px]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent z-0 pointer-events-none" />

                            <div className="relative z-10 w-full flex items-center justify-between mt-auto mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border border-white/10 flex items-center justify-center text-white/50 text-sm font-bold shadow-inner">
                                        P1
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm font-medium">Prospecto (John)</span>
                                        <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Falando agora...</span>
                                    </div>
                                </div>

                                <div className="h-8 flex items-end justify-center gap-[3px]">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <motion.div
                                            key={`bar-${i}`}
                                            className="w-1 bg-blue-400 rounded-t-full"
                                            animate={{
                                                height: phase === 'listening'
                                                    ? ["10%", `${Math.random() * 90 + 10}%`, "10%"]
                                                    : ["10%", "15%", "10%"],
                                                backgroundColor: phase === 'listening' ? '#60A5FA' : '#374151'
                                            }}
                                            transition={{
                                                duration: phase === 'listening' ? 0.3 + Math.random() * 0.4 : 1.5,
                                                repeat: Infinity
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Transcripts Area */}
                        <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden relative">
                            {/* History mock transcript */}
                            <div className="bg-transparent rounded-xl p-0 w-[90%] opacity-40">
                                <span className="text-[10px] font-bold text-neutral-600 mb-1 block uppercase tracking-widest">Você</span>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    "E como vocês estão lidando com a gestão das oportunidades perdidas?"
                                </p>
                            </div>

                            <AnimatePresence>
                                {(phase === 'transcribing' || phase === 'processing' || phase === 'suggesting') && (
                                    <motion.div
                                        key="transcript-1"
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                        className="bg-white/5 rounded-xl p-4 w-[90%] border border-white/10 shadow-lg"
                                    >
                                        <span className="text-[10px] font-bold text-white mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Prospecto (John)
                                        </span>
                                        <p className="text-[13px] text-neutral-300 leading-relaxed font-medium">
                                            "A solução de vocês parece muito completa, mas o preço está bem acima do que pagamos na ferramenta atual. Não sei se o orçamento aprova."
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Panel: Coach Feed (50%) */}
                    <div className="flex-1 md:flex-[0.5] bg-neutral-900 flex flex-col relative shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-20 overflow-hidden">

                        {/* Loading Overlay Glow */}
                        <AnimatePresence>
                            {(phase === 'processing' || phase === 'suggesting') && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5, scale: [0.8, 1.2, 0.8] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none"
                                />
                            )}
                        </AnimatePresence>

                        {/* Feed Header */}
                        <div className="px-6 py-4 border-b border-white/5 bg-neutral-900 z-10 shrink-0 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                Insights do Coach
                            </h2>
                            <AnimatePresence>
                                {phase === 'processing' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                        Processando Oportunidade
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Feed Content */}
                        <div className="flex-1 p-6 relative flex flex-col items-center justify-center">

                            {/* Background Grid Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

                            <AnimatePresence mode="popLayout">
                                {/* Waiting State */}
                                {(phase === 'listening' || phase === 'transcribing') && (
                                    <motion.div
                                        key="waiting-state"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center opacity-30 m-auto relative z-10"
                                    >
                                        <Lightbulb className="w-10 h-10 text-white mx-auto mb-4" />
                                        <p className="text-[13px] text-white font-medium max-w-[200px] mx-auto leading-relaxed">
                                            Fale algo para receber insights em tempo real...
                                        </p>
                                    </motion.div>
                                )}

                                {/* AI Suggestion State */}
                                {phase === 'suggesting' && (
                                    <motion.div
                                        key="suggestion-card"
                                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                                        className="w-full p-6 rounded-2xl border relative overflow-hidden bg-white/5 border-white/20 mt-auto shadow-2xl backdrop-blur-md"
                                    >
                                        {/* Premium Card Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                                        <div className="flex items-center gap-3 mb-5 relative z-10">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                                <AlertTriangle className="w-4 h-4 fill-current" />
                                            </div>
                                            <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-white">
                                                OBJEÇÃO DE PREÇO
                                            </span>
                                            <span className="ml-auto px-2 py-0.5 rounded border border-white/20 bg-white/10 text-[9px] text-white font-mono uppercase tracking-widest hidden sm:block">
                                                ALTO IMPACTO
                                            </span>
                                        </div>

                                        <div className="relative z-10">
                                            <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Target className="w-3.5 h-3.5" /> Ação Recomendada
                                            </h4>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-2.5 text-[15px] text-neutral-200 leading-relaxed">
                                                    <span className="text-white mt-1 shrink-0"><CheckCircle2 className="w-4 h-4" /></span>
                                                    <span>
                                                        <strong className="text-white font-bold">Mude o foco para ROI.</strong>
                                                        {' '}Cite o estudo de caso da "Acme Corp" onde economizamos 40 horas semanais no processo deles.
                                                    </span>
                                                </li>
                                            </ul>
                                            <div className="flex gap-2 mt-5">
                                                <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 border border-white/10 text-neutral-300 font-semibold tracking-wider uppercase">
                                                    ROI
                                                </span>
                                                <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 border border-white/10 text-neutral-300 font-semibold tracking-wider uppercase">
                                                    Case de Sucesso
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Animated Scanner (Subtle) for the entire app */}
                <motion.div
                    className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-white/5 to-transparent z-30 pointer-events-none mix-blend-screen"
                    animate={{ top: ["-30%", "150%"] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                />
            </motion.div>
        </div>
    );
}
