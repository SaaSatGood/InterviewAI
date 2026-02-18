// Audio Capture Hook — Mic + System Audio + Mixer
// Enhanced version with gain control, track end detection, and robust error handling

import { useState, useCallback, useRef, useEffect } from 'react';

export type CaptureMode = 'call' | 'presential';

export interface AudioCaptureState {
    micStream: MediaStream | null;
    systemStream: MediaStream | null;
    mixedStream: MediaStream | null;
    isCapturing: boolean;
    isMuted: boolean;
    mode: CaptureMode;
    error: string | null;
    micVolume: number;
    systemVolume: number;
    hasSystemAudio: boolean;  // Whether system audio is actually captured
}

export interface AudioCaptureResult {
    mixedStream: MediaStream;
    micStream: MediaStream;
    systemStream: MediaStream | null;
}

interface AudioCaptureReturn extends AudioCaptureState {
    startCapture: (mode: CaptureMode) => Promise<AudioCaptureResult | null>;
    stopCapture: () => void;
    toggleMute: () => void;
    setMicGain: (gain: number) => void;
    setSystemGain: (gain: number) => void;
    getMicAnalyser: () => AnalyserNode | null;
    getSystemAnalyser: () => AnalyserNode | null;
}

export function useAudioCapture(): AudioCaptureReturn {
    const [state, setState] = useState<AudioCaptureState>({
        micStream: null,
        systemStream: null,
        mixedStream: null,
        isCapturing: false,
        isMuted: false,
        mode: 'presential',
        error: null,
        micVolume: 0,
        systemVolume: 0,
        hasSystemAudio: false,
    });

    const audioContextRef = useRef<AudioContext | null>(null);
    const micAnalyserRef = useRef<AnalyserNode | null>(null);
    const systemAnalyserRef = useRef<AnalyserNode | null>(null);
    const micGainRef = useRef<GainNode | null>(null);
    const systemGainRef = useRef<GainNode | null>(null);
    const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamsRef = useRef<{ mic: MediaStream | null; system: MediaStream | null; mixed: MediaStream | null }>({
        mic: null,
        system: null,
        mixed: null,
    });

    const getVolume = (analyser: AnalyserNode): number => {
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            const val = (data[i] - 128) / 128;
            sum += val * val;
        }
        return Math.sqrt(sum / data.length);
    };

    const startVolumeMonitoring = useCallback(() => {
        if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
        volumeIntervalRef.current = setInterval(() => {
            const micVol = micAnalyserRef.current ? getVolume(micAnalyserRef.current) : 0;
            const sysVol = systemAnalyserRef.current ? getVolume(systemAnalyserRef.current) : 0;
            setState(prev => ({ ...prev, micVolume: micVol, systemVolume: sysVol }));
        }, 100);
    }, []);

    const startCapture = useCallback(async (mode: CaptureMode): Promise<AudioCaptureResult | null> => {
        try {
            setState(prev => ({ ...prev, error: null, mode, hasSystemAudio: false }));

            // Resume or create AudioContext with fallback
            let ctx = audioContextRef.current;
            if (!ctx || ctx.state === 'closed') {
                try {
                    ctx = new AudioContext({ sampleRate: 48000 });
                } catch {
                    // Fallback for browsers that don't support 48kHz
                    try {
                        ctx = new AudioContext();
                    } catch (ctxErr) {
                        const msg = ctxErr instanceof Error ? ctxErr.message : 'Audio not supported';
                        setState(prev => ({ ...prev, error: `⚠️ ${msg}. Try using Chrome or Edge.`, isCapturing: false }));
                        return null;
                    }
                }
                audioContextRef.current = ctx;
            }

            if (ctx.state === 'suspended') {
                try {
                    await ctx.resume();
                } catch {
                    setState(prev => ({ ...prev, error: '⚠️ Audio blocked by browser. Click the page first and try again.' }));
                    return null;
                }
            }

            const dest = ctx.createMediaStreamDestination();

            // 1. Capture microphone (always required)
            let micStream: MediaStream;
            try {
                micStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        channelCount: 1,
                    },
                });
            } catch (micErr) {
                const msg = micErr instanceof Error ? micErr.message : 'Erro ao acessar microfone';
                setState(prev => ({ ...prev, error: `🎤 ${msg}`, isCapturing: false }));
                return null;
            }

            // Setup mic audio chain: Source -> Gain -> Analyser -> Destination
            const micSource = ctx.createMediaStreamSource(micStream);
            const micGain = ctx.createGain();
            micGain.gain.value = 1.0;  // Default gain
            const micAnalyser = ctx.createAnalyser();
            micAnalyser.fftSize = 256;

            micSource.connect(micGain);
            micGain.connect(micAnalyser);
            micGain.connect(dest);

            micAnalyserRef.current = micAnalyser;
            micGainRef.current = micGain;

            let systemStream: MediaStream | null = null;
            let hasSystemAudio = false;

            // 2. Capture system audio (call mode only)
            if (mode === 'call') {
                // Check browser support
                if (!navigator.mediaDevices.getDisplayMedia) {
                    setState(prev => ({ ...prev, error: '⚠️ Seu navegador não suporta captura de áudio do sistema. Use Chrome ou Edge.' }));
                } else {
                    try {
                        // Request screen share with audio
                        systemStream = await navigator.mediaDevices.getDisplayMedia({
                            video: {
                                width: { ideal: 1 },
                                height: { ideal: 1 },
                                frameRate: { ideal: 1 },
                            },
                            audio: {
                                echoCancellation: false,  // Don't cancel echo from system
                                noiseSuppression: false,  // Keep original audio
                                autoGainControl: false,   // Don't modify volume
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any);

                        // Immediately stop video tracks (we only need audio)
                        systemStream.getVideoTracks().forEach(track => {
                            track.stop();
                        });

                        const audioTracks = systemStream.getAudioTracks();

                        if (audioTracks.length > 0) {
                            hasSystemAudio = true;

                            // Listen for track ending (user stops screen share)
                            audioTracks[0].addEventListener('ended', () => {
                                console.log('System audio track ended');
                                setState(prev => ({ ...prev, hasSystemAudio: false, systemVolume: 0 }));
                                systemAnalyserRef.current = null;
                                streamsRef.current.system = null;
                            });

                            // Setup system audio chain: Source -> Gain -> Analyser -> Destination
                            const sysSource = ctx.createMediaStreamSource(systemStream);
                            const sysGain = ctx.createGain();
                            sysGain.gain.value = 1.5;  // Boost system audio slightly
                            const sysAnalyser = ctx.createAnalyser();
                            sysAnalyser.fftSize = 256;

                            sysSource.connect(sysGain);
                            sysGain.connect(sysAnalyser);
                            sysGain.connect(dest);

                            systemAnalyserRef.current = sysAnalyser;
                            systemGainRef.current = sysGain;
                        } else {
                            setState(prev => ({
                                ...prev,
                                error: '⚠️ Nenhum áudio capturado. Certifique-se de selecionar "Compartilhar áudio" ao escolher a aba.'
                            }));
                        }
                    } catch (sysErr) {
                        // User cancelled or not supported
                        const msg = sysErr instanceof Error ? sysErr.message : '';
                        if (msg.includes('Permission denied') || msg.includes('cancelled')) {
                            setState(prev => ({
                                ...prev,
                                error: '⚠️ Captura de tela cancelada. Usando apenas microfone.'
                            }));
                        } else {
                            console.warn('System audio capture failed:', sysErr);
                            setState(prev => ({
                                ...prev,
                                error: '⚠️ Não foi possível capturar áudio do sistema. Usando apenas microfone.'
                            }));
                        }
                    }
                }
            }

            const mixedStream = dest.stream;

            // Store refs for immediate access
            streamsRef.current = { mic: micStream, system: systemStream, mixed: mixedStream };

            setState({
                micStream,
                systemStream,
                mixedStream,
                isCapturing: true,
                isMuted: false,
                mode,
                error: state.error, // Preserve any warning
                micVolume: 0,
                systemVolume: 0,
                hasSystemAudio,
            });

            startVolumeMonitoring();

            return {
                mixedStream,
                micStream,
                systemStream,
            };
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Falha ao capturar áudio';
            setState(prev => ({ ...prev, error: `❌ ${msg}`, isCapturing: false }));
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startVolumeMonitoring]);

    const stopCapture = useCallback(() => {
        if (volumeIntervalRef.current) {
            clearInterval(volumeIntervalRef.current);
            volumeIntervalRef.current = null;
        }

        // Stop all tracks
        streamsRef.current.mic?.getTracks().forEach(t => t.stop());
        streamsRef.current.system?.getTracks().forEach(t => t.stop());
        streamsRef.current = { mic: null, system: null, mixed: null };

        // Close audio context
        audioContextRef.current?.close();
        audioContextRef.current = null;
        micAnalyserRef.current = null;
        systemAnalyserRef.current = null;
        micGainRef.current = null;
        systemGainRef.current = null;

        setState({
            micStream: null,
            systemStream: null,
            mixedStream: null,
            isCapturing: false,
            isMuted: false,
            mode: 'presential',
            error: null,
            micVolume: 0,
            systemVolume: 0,
            hasSystemAudio: false,
        });
    }, []);

    const toggleMute = useCallback(() => {
        setState(prev => {
            const newMuted = !prev.isMuted;

            // Disable/enable mic tracks
            streamsRef.current.mic?.getAudioTracks().forEach(track => {
                track.enabled = !newMuted;
            });

            return { ...prev, isMuted: newMuted };
        });
    }, []);

    const setMicGain = useCallback((gain: number) => {
        if (micGainRef.current) {
            micGainRef.current.gain.value = Math.max(0, Math.min(2, gain)); // Clamp 0-2
        }
    }, []);

    const setSystemGain = useCallback((gain: number) => {
        if (systemGainRef.current) {
            systemGainRef.current.gain.value = Math.max(0, Math.min(3, gain)); // Clamp 0-3
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
            streamsRef.current.mic?.getTracks().forEach(t => t.stop());
            streamsRef.current.system?.getTracks().forEach(t => t.stop());
            audioContextRef.current?.close();
        };
    }, []);

    return {
        ...state,
        startCapture,
        stopCapture,
        toggleMute,
        setMicGain,
        setSystemGain,
        getMicAnalyser: () => micAnalyserRef.current,
        getSystemAnalyser: () => systemAnalyserRef.current,
    };
}
