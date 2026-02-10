// Transcription Hook — Connects audio capture to various transcription engines
// Supports: Web Speech API (free), Whisper REST API, and OpenAI Realtime API

import { useState, useCallback, useRef, useEffect } from 'react';
import { RealtimeTranscriber } from '@/lib/realtimeApi';
import { WhisperTranscriber } from '@/lib/whisperApi';
import { WebSpeechTranscriber, isWebSpeechSupported } from '@/lib/webSpeechApi';
import { SpeakerTracker, Speaker } from '@/lib/speakerDetection';
import { CaptureMode } from './useAudioCapture';

export type TranscriptionEngine = 'browser' | 'whisper' | 'realtime';

export interface TranscriptSegment {
    id: string;
    text: string;
    speaker: Speaker;
    timestamp: number;
    isFinal: boolean;
}

interface TranscriptionState {
    segments: TranscriptSegment[];
    currentPartial: string;
    currentSpeaker: Speaker;
    isListening: boolean;
    status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'recording' | 'transcribing' | 'listening';
    error: string | null;
    engine: TranscriptionEngine;
}

interface TranscriptionReturn extends TranscriptionState {
    startListening: (stream: MediaStream, apiKey: string | null, mode: CaptureMode, engine?: TranscriptionEngine, language?: string) => void;
    stopListening: () => void;
    pauseListening: () => void;
    resumeListening: () => void;
    clearTranscript: () => void;
}

export { isWebSpeechSupported };

export function useTranscription(): TranscriptionReturn {
    const [state, setState] = useState<TranscriptionState>({
        segments: [],
        currentPartial: '',
        currentSpeaker: 'unknown',
        isListening: false,
        status: 'idle',
        error: null,
        engine: 'browser',
    });

    const realtimeRef = useRef<RealtimeTranscriber | null>(null);
    const whisperRef = useRef<WhisperTranscriber | null>(null);
    const webSpeechRef = useRef<WebSpeechTranscriber | null>(null);
    const speakerTrackerRef = useRef<SpeakerTracker | null>(null);
    const segmentCounterRef = useRef(0);

    // Update speaker from external volume data
    const updateSpeaker = useCallback((micVolume: number, systemVolume: number) => {
        if (!speakerTrackerRef.current) return;
        const speaker = speakerTrackerRef.current.push(micVolume, systemVolume);
        setState(prev => ({ ...prev, currentSpeaker: speaker }));
    }, []);

    const startListening = useCallback((
        stream: MediaStream,
        apiKey: string | null,
        mode: CaptureMode,
        engine: TranscriptionEngine = 'browser',
        language?: string
    ) => {
        speakerTrackerRef.current = new SpeakerTracker(mode);
        setState(prev => ({ ...prev, engine, error: null }));

        if (engine === 'browser') {
            // Use Web Speech API (FREE, no API key needed)
            const webSpeech = new WebSpeechTranscriber(
                { language, continuous: true },
                // onTranscript
                (text, isFinal) => {
                    if (isFinal) {
                        const id = `seg-${++segmentCounterRef.current}`;
                        setState(prev => {
                            const newSegment: TranscriptSegment = {
                                id,
                                text,
                                speaker: prev.currentSpeaker,
                                timestamp: Date.now(),
                                isFinal: true,
                            };
                            return {
                                ...prev,
                                segments: [...prev.segments, newSegment],
                                currentPartial: '',
                            };
                        });
                    } else {
                        setState(prev => ({ ...prev, currentPartial: text }));
                    }
                },
                // onError
                (error) => {
                    setState(prev => ({ ...prev, error }));
                },
                // onStatusChange
                (status) => {
                    setState(prev => ({
                        ...prev,
                        status: status === 'listening' ? 'connected' : status,
                        isListening: status === 'listening',
                    }));
                }
            );

            webSpeechRef.current = webSpeech;
            webSpeech.start();

        } else if (engine === 'whisper') {
            // Use Whisper REST API (requires API key)
            if (!apiKey) {
                setState(prev => ({ ...prev, error: 'API key required for Whisper', status: 'error' }));
                return;
            }

            const whisper = new WhisperTranscriber(
                { apiKey, language },
                // onTranscript
                (text, isFinal) => {
                    const id = `seg-${++segmentCounterRef.current}`;
                    setState(prev => {
                        const newSegment: TranscriptSegment = {
                            id,
                            text,
                            speaker: prev.currentSpeaker,
                            timestamp: Date.now(),
                            isFinal,
                        };
                        return {
                            ...prev,
                            segments: [...prev.segments, newSegment],
                        };
                    });
                },
                // onError
                (error) => {
                    setState(prev => ({ ...prev, error }));
                },
                // onStatusChange
                (status) => {
                    const mappedStatus = status === 'recording' ? 'connected' : status;
                    setState(prev => ({
                        ...prev,
                        status: mappedStatus as TranscriptionState['status'],
                        isListening: status === 'recording' || status === 'transcribing',
                    }));
                }
            );

            whisperRef.current = whisper;
            whisper.start(stream);

        } else {
            // Use Realtime API (requires paid tier)
            if (!apiKey) {
                setState(prev => ({ ...prev, error: 'API key required for Realtime API', status: 'error' }));
                return;
            }

            const transcriber = new RealtimeTranscriber(
                { apiKey, language },
                // onTranscript
                (delta) => {
                    if (delta.type === 'delta') {
                        setState(prev => ({
                            ...prev,
                            currentPartial: prev.currentPartial + delta.text,
                        }));
                    } else if (delta.type === 'done') {
                        const id = `seg-${++segmentCounterRef.current}`;
                        setState(prev => {
                            const newSegment: TranscriptSegment = {
                                id,
                                text: delta.text,
                                speaker: prev.currentSpeaker,
                                timestamp: Date.now(),
                                isFinal: true,
                            };
                            return {
                                ...prev,
                                segments: [...prev.segments, newSegment],
                                currentPartial: '',
                            };
                        });
                    }
                },
                // onError
                (error) => {
                    setState(prev => ({ ...prev, error }));
                },
                // onStatusChange
                (status) => {
                    setState(prev => ({
                        ...prev,
                        status,
                        isListening: status === 'connected',
                    }));
                }
            );

            realtimeRef.current = transcriber;
            transcriber.connect(stream);
        }
    }, []);

    const stopListening = useCallback(() => {
        realtimeRef.current?.disconnect();
        realtimeRef.current = null;
        whisperRef.current?.disconnect();
        whisperRef.current = null;
        webSpeechRef.current?.disconnect();
        webSpeechRef.current = null;
        speakerTrackerRef.current?.reset();
        setState(prev => ({
            ...prev,
            isListening: false,
            status: 'idle',
            currentPartial: '',
        }));
    }, []);

    const clearTranscript = useCallback(() => {
        setState(prev => ({ ...prev, segments: [], currentPartial: '' }));
        segmentCounterRef.current = 0;
    }, []);

    const pauseListening = useCallback(() => {
        webSpeechRef.current?.pause();
        // For whisper/realtime, we don't need to do anything special
        // since they use the stream which is already muted
    }, []);

    const resumeListening = useCallback(() => {
        webSpeechRef.current?.resume();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            realtimeRef.current?.disconnect();
            whisperRef.current?.disconnect();
            webSpeechRef.current?.disconnect();
        };
    }, []);

    return {
        ...state,
        startListening,
        stopListening,
        pauseListening,
        resumeListening,
        clearTranscript,
        updateSpeaker,
    } as TranscriptionReturn & { updateSpeaker: (mic: number, sys: number) => void };
}
