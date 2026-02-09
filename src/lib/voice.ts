// Voice utilities for speech recognition and synthesis
// Uses Web Speech API with comprehensive error handling

import { Language } from './i18n';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionInterface extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionInterface;
        webkitSpeechRecognition: new () => SpeechRecognitionInterface;
    }
}

// Types
export type VoiceState = 'idle' | 'listening' | 'speaking' | 'processing' | 'error';

export interface VoiceError {
    code: 'NOT_SUPPORTED' | 'PERMISSION_DENIED' | 'NO_SPEECH' | 'NETWORK' | 'UNKNOWN';
    message: string;
}

// Language mapping for speech recognition
const LANGUAGE_CODES: Record<Language, string> = {
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
};

// Check browser support
export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
}

// Get SpeechRecognition constructor
function getSpeechRecognition(): (new () => SpeechRecognitionInterface) | null {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// Voice Recorder Class
export class VoiceRecorder {
    private recognition: SpeechRecognitionInterface | null = null;
    private isListening = false;
    private language: Language = 'en';

    public onResult: ((transcript: string, isFinal: boolean) => void) | null = null;
    public onStateChange: ((state: VoiceState) => void) | null = null;
    public onError: ((error: VoiceError) => void) | null = null;
    public onAudioLevel: ((level: number) => void) | null = null;

    constructor(language: Language = 'en') {
        this.language = language;
        this.initRecognition();
    }

    private initRecognition(): void {
        const SpeechRecognitionClass = getSpeechRecognition();
        if (!SpeechRecognitionClass) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = LANGUAGE_CODES[this.language];

        this.recognition.onstart = () => {

            this.isListening = true;
            this.onStateChange?.('listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.onStateChange?.('idle');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.onResult?.(finalTranscript.trim(), true);
            } else if (interimTranscript) {
                this.onResult?.(interimTranscript.trim(), false);
            }

            // Simulate audio level from confidence
            const lastResult = event.results[event.results.length - 1];
            if (lastResult) {
                const confidence = lastResult[0].confidence || 0.5;
                this.onAudioLevel?.(confidence);
            }
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            const errorMap: Record<string, VoiceError> = {
                'not-allowed': { code: 'PERMISSION_DENIED', message: 'Microphone permission was denied' },
                'no-speech': { code: 'NO_SPEECH', message: 'No speech was detected' },
                'network': { code: 'NETWORK', message: 'Network error occurred' },
                'aborted': { code: 'UNKNOWN', message: 'Recognition was aborted' },
            };
            const error = errorMap[event.error] || { code: 'UNKNOWN', message: `Unknown error: ${event.error}` };
            this.onError?.(error);
            this.onStateChange?.('error');
        };
    }

    setLanguage(language: Language): void {
        this.language = language;
        if (this.recognition) {
            this.recognition.lang = LANGUAGE_CODES[language];
        }
    }

    async start(): Promise<void> {
        if (!this.recognition) {
            this.onError?.({ code: 'NOT_SUPPORTED', message: 'Speech recognition is not supported in this browser' });
            return;
        }

        if (this.isListening) {
            return;
        }

        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recognition.start();
        } catch (err) {
            this.onError?.({ code: 'PERMISSION_DENIED', message: 'Microphone access was denied' });
            this.onStateChange?.('error');
        }
    }

    stop(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    isActive(): boolean {
        return this.isListening;
    }

    destroy(): void {
        this.stop();
        this.recognition = null;
    }
}

// Voice Speaker Class
export class VoiceSpeaker {
    private synthesis: SpeechSynthesis | null = null;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private language: Language = 'en';
    private rate = 1.0;
    private pitch = 1.0;
    private voiceId: string | null = null;

    public onStateChange: ((state: VoiceState) => void) | null = null;
    public onProgress: ((progress: number) => void) | null = null;
    public onEnd: (() => void) | null = null;

    constructor(language: Language = 'en') {
        this.language = language;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    setLanguage(language: Language): void {
        this.language = language;
    }

    setRate(rate: number): void {
        this.rate = Math.max(0.5, Math.min(2, rate));
    }

    setPitch(pitch: number): void {
        this.pitch = Math.max(0.5, Math.min(2, pitch));
    }

    setVoice(voiceId: string): void {
        this.voiceId = voiceId;
    }

    getAvailableVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices().filter(voice =>
            voice.lang.startsWith(LANGUAGE_CODES[this.language].split('-')[0])
        );
    }

    speak(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }

            // Cancel any ongoing speech
            this.stop();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = LANGUAGE_CODES[this.language];
            utterance.rate = this.rate;
            utterance.pitch = this.pitch;

            // Set voice if specified
            if (this.voiceId) {
                const voices = this.synthesis.getVoices();
                const voice = voices.find(v => v.voiceURI === this.voiceId);
                if (voice) {
                    utterance.voice = voice;
                }
            } else {
                // Use first available voice for the language
                const voices = this.getAvailableVoices();
                if (voices.length > 0) {
                    utterance.voice = voices[0];
                }
            }

            utterance.onstart = () => {
                this.onStateChange?.('speaking');
            };

            utterance.onend = () => {
                this.currentUtterance = null;
                this.onStateChange?.('idle');
                this.onEnd?.();
                resolve();
            };

            utterance.onerror = (event) => {
                this.currentUtterance = null;
                this.onStateChange?.('idle');
                reject(new Error(`Speech error: ${event.error}`));
            };

            // Track progress for animation
            utterance.onboundary = (event) => {
                if (event.charIndex !== undefined && text.length > 0) {
                    const progress = event.charIndex / text.length;
                    this.onProgress?.(progress);
                }
            };

            this.currentUtterance = utterance;
            this.synthesis.speak(utterance);
        });
    }

    stop(): void {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.currentUtterance = null;
            this.onStateChange?.('idle');
        }
    }

    pause(): void {
        if (this.synthesis) {
            this.synthesis.pause();
        }
    }

    resume(): void {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }

    isSpeaking(): boolean {
        return this.synthesis?.speaking || false;
    }
}

// Available AI models by provider (updated Feb 2026)
export const AI_MODELS = {
    openai: [
        { id: 'gpt-5', name: 'GPT-5', description: 'Most capable, multimodal reasoning' },
        { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and efficient' },
        { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Great for coding and instructions' },
        { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Cost-efficient' },
        { id: 'o3', name: 'o3', description: 'Best for math and reasoning' },
        { id: 'o4-mini', name: 'o4-mini', description: 'Fast STEM reasoning' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Omni model, multimodal' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
    ],
    gemini: [
        { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Newest, fastest and smartest' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Complex reasoning, 1M context' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Speed and capability balance' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'General purpose multimodal' },
    ],
    anthropic: [
        { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', description: 'Most intelligent, best for agents' },
        { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', description: 'Great for coding and vision' },
        { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', description: 'Fast and intelligent balance' },
        { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', description: 'Fastest, real-time apps' },
        { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Great for most tasks' },
    ],
    azure: [
        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Most capable (Azure)' },
    ],
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS][number];
