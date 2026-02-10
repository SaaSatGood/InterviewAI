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
    recruiter: { label: 'Recruiter', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: '🟦' },
    candidate: { label: 'You', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🟩' },
    unknown: { label: 'Speaker', color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-500/20', icon: '⬜' },
    overlap: { label: 'Overlap', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '🟨' },
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
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                <span className="text-sm font-medium text-neutral-300">📝 Transcript</span>
                <span className="text-xs text-neutral-500">{segments.length} segments</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {segments.length === 0 && !currentPartial && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-neutral-500 text-sm text-center">
                            Waiting for speech...<br />
                            <span className="text-xs text-neutral-600">Speak to see the transcript here</span>
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    {segments.map(seg => {
                        const style = SPEAKER_STYLES[seg.speaker] || SPEAKER_STYLES.unknown;
                        return (
                            <motion.div
                                key={seg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-lg border ${style.bg}`}
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
