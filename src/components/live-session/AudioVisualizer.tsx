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
        <div className="h-full flex flex-col relative overflow-hidden bg-neutral-900/50 border-r border-white/5">
            {/* 1. Header / Status */}
            <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-neutral-950 to-transparent">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-white animate-pulse' : 'bg-neutral-600'}`} />
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {isSpeaking ? t('coach.listeningTo') : t('coach.monitoring')}
                    </span>
                </div>
            </div>

            {/* 2. Visual Pulse (Centered Background) */}
            <div className="absolute inset-x-0 top-0 h-1/2 flex items-center justify-center pointer-events-none z-10">
                <motion.div
                    animate={{
                        scale: isSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
                        opacity: isSpeaking ? [0.1, 0.3, 0.1] : [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-white/5 rounded-full blur-[80px]"
                />
            </div>

            {/* 3. Transcript Feed */}
            <div className="flex-1 mt-32 px-6 pb-6 overflow-y-auto z-20 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent md:pr-4" ref={scrollRef}>
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
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${isRecruiter ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-white">
                                <User className="w-4 h-4" />
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${isRecruiter
                                ? 'bg-white/5 text-neutral-200 rounded-tl-none border border-white/5'
                                : 'bg-white/10 text-white rounded-tr-none border border-white/20'
                                }`}>
                                {seg.text}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* 4. Canvas Waveform (Bottom) — smooth 60fps rendering */}
            <div className="h-16 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <CanvasWaveform isSpeaking={isSpeaking} micVolume={micVolume} />
            </div>
        </div>
    );
}
