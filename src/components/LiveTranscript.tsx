'use client';

// LiveTranscript — Real-time scrolling transcript with speaker labels
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TranscriptSegment } from '@/hooks/useTranscription';

interface LiveTranscriptProps {
    segments: TranscriptSegment[];
    currentPartial: string;
    currentSpeaker: string;
}

const SPEAKER_STYLES: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    recruiter: { label: 'Prospect/Lead', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: '👤' },
    candidate: { label: 'Closer (You)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🛡️' },
    unknown: { label: 'System', color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-500/20', icon: '⚪' },
    overlap: { label: 'Overlap', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '⚠️' },
};

export function LiveTranscript({ segments, currentPartial, currentSpeaker }: LiveTranscriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments, currentPartial]);

    const formatTime = (ts: number) => {
        // Return placeholder during SSR to avoid hydration mismatch
        if (typeof window === 'undefined') return "00:00:00";
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.03] backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Live Intel</span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[10px] text-neutral-600 font-semibold tracking-wider uppercase">{segments.length} LOGS</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-xl animate-pulse">📡</span>
                    </div>
                    <div>
                        <p className="text-neutral-300 font-medium text-xs uppercase tracking-widest">Awaiting Capture</p>
                        <p className="text-neutral-500 text-xs mt-1 max-w-[200px]">Speak or wait for the prospect to start the conversation.</p>
                    </div>
                </div>

                <AnimatePresence>
                    {segments.map(seg => {
                        const style = SPEAKER_STYLES[seg.speaker] || SPEAKER_STYLES.unknown;
                        return (
                            <motion.div
                                key={seg.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-3 rounded-xl border glass-card ${style.bg}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs">{style.icon}</span>
                                    <span className={`text-xs font-medium ${style.color}`}>{style.label}</span>
                                    <span className="text-xs text-neutral-600">{formatTime(seg.timestamp)}</span>
                                </div>
                                <p className="text-sm text-neutral-200 leading-relaxed">{seg.text}</p>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Current partial transcript */}
                {currentPartial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-3 rounded-lg border border-dashed ${SPEAKER_STYLES[currentSpeaker]?.bg || SPEAKER_STYLES.unknown.bg}`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs">{SPEAKER_STYLES[currentSpeaker]?.icon || '⬜'}</span>
                            <span className={`text-xs font-medium ${SPEAKER_STYLES[currentSpeaker]?.color || 'text-neutral-400'}`}>
                                {SPEAKER_STYLES[currentSpeaker]?.label || 'Speaker'}
                            </span>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        <p className="text-sm text-neutral-400 italic">{currentPartial}▌</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
