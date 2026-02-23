'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { TranscriptSegment } from '@/hooks/useTranscription';

interface AudioVisualizerProps {
    isSpeaking: boolean;
    micVolume: number;
    segments: TranscriptSegment[];
}

/**
 * Canvas-based waveform renderer for smooth 60fps animation.
 * Replaces the previous DOM-based approach (20 animated divs) with a single canvas.
 */
function CanvasWaveform({ isSpeaking, micVolume }: { isSpeaking: boolean; micVolume: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const barsRef = useRef<number[]>(new Array(24).fill(4));

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Set actual canvas size for sharp rendering
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const barCount = barsRef.current.length;
        const barWidth = 3;
        const barGap = (width - barCount * barWidth) / (barCount + 1);
        const maxHeight = height - 8;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Update bar target heights
        for (let i = 0; i < barCount; i++) {
            const target = isSpeaking
                ? Math.max(4, (Math.sin(Date.now() / 200 + i * 0.5) * 0.5 + 0.5) * maxHeight * Math.min(micVolume * 4, 1))
                : 4;
            // Smooth interpolation (lerp)
            barsRef.current[i] += (target - barsRef.current[i]) * 0.15;
        }

        // Draw bars
        for (let i = 0; i < barCount; i++) {
            const x = barGap + i * (barWidth + barGap);
            const h = barsRef.current[i];
            const y = (height - h) / 2;

            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, h, barWidth / 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${isSpeaking ? 0.6 : 0.2})`;
            ctx.fill();
        }

        animRef.current = requestAnimationFrame(draw);
    }, [isSpeaking, micVolume]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
        />
    );
}

export function AudioVisualizer({ isSpeaking, micVolume, segments }: AudioVisualizerProps) {
    const { t } = useAppStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of transcript
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments]);

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-neutral-900/50">
            {/* 1. Header / Status */}
            <div className="p-4 z-20 bg-neutral-950 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`} />
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {isSpeaking ? "Ouvindo" : "Aguardando Áudio"}
                    </span>
                </div>
            </div>

            {/* 2. Transcript Feed */}
            <div className="flex-1 p-4 overflow-y-auto z-20 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent" ref={scrollRef}>
                {segments.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <Mic className="w-8 h-8 text-neutral-600 mb-4" />
                        <p className="text-sm text-neutral-500 max-w-xs">{t('coach.transcriptPlaceholder') || "Aguardando início da conversa..."}</p>
                    </div>
                )}

                {segments.map((seg, i) => {
                    const isRecruiter = seg.speaker === 'recruiter';
                    return (
                        <motion.div
                            key={seg.id || i}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={`flex gap-3 ${isRecruiter ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto mb-1 ${isRecruiter ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                <User className="w-4 h-4" />
                            </div>
                            <div className={`max-w-[85%] rounded-[1.25rem] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isRecruiter
                                ? 'bg-indigo-500/10 text-indigo-100 rounded-bl-sm border border-indigo-500/20'
                                : 'bg-emerald-500/10 text-emerald-100 rounded-br-sm border border-emerald-500/20'
                                }`}>
                                {seg.text}
                            </div>
                        </motion.div>
                    );
                })}

                {/* Live Typing / Listening Indicator */}
                {isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3 flex-row"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto mb-1 bg-white/5 text-neutral-500">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="bg-neutral-800/50 border border-white/5 rounded-[1.25rem] rounded-bl-sm px-4 py-3 flex items-center gap-1.5 h-10 shadow-sm">
                            <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
                            />
                            <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
                            />
                            <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
