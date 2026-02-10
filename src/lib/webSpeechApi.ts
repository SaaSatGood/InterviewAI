// Web Speech API Client — Browser-based transcription (FREE)
// Uses native browser speech recognition, no API key required

export type WebSpeechStatus = 'idle' | 'listening' | 'error';

interface WebSpeechConfig {
    language?: string;
    continuous?: boolean;
}

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
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

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = new () => SpeechRecognition;

/**
 * Check if Web Speech API is supported
 */
export function isWebSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Get browser-appropriate SpeechRecognition constructor
 */
function getSpeechRecognition(): SpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Web Speech API Transcriber
 * Completely free, runs in browser, no API key needed
 */
export class WebSpeechTranscriber {
    private recognition: SpeechRecognition | null = null;
    private config: WebSpeechConfig;
    private onTranscript: (text: string, isFinal: boolean) => void;
    private onError: (error: string) => void;
    private onStatusChange: (status: WebSpeechStatus) => void;
    private isActive = false;
    private isPaused = false;  // Separate flag to handle pause/resume
    private restartTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(
        config: WebSpeechConfig,
        onTranscript: (text: string, isFinal: boolean) => void,
        onError: (error: string) => void,
        onStatusChange: (status: WebSpeechStatus) => void
    ) {
        this.config = config;
        this.onTranscript = onTranscript;
        this.onError = onError;
        this.onStatusChange = onStatusChange;
    }

    start(): boolean {
        const SpeechRecognitionClass = getSpeechRecognition();

        if (!SpeechRecognitionClass) {
            this.onError('Web Speech API not supported in this browser. Use Chrome or Edge.');
            this.onStatusChange('error');
            return false;
        }

        try {
            this.recognition = new SpeechRecognitionClass();
            this.recognition.continuous = this.config.continuous ?? true;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;

            // Set language
            const lang = this.config.language || 'en-US';
            this.recognition.lang = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';

            this.recognition.onstart = () => {
                this.isActive = true;
                this.onStatusChange('listening');
            };

            this.recognition.onend = () => {
                // Auto-restart if still active AND not paused (continuous mode workaround)
                if (this.isActive && !this.isPaused) {
                    this.restartTimeout = setTimeout(() => {
                        if (this.isActive && !this.isPaused && this.recognition) {
                            try {
                                this.recognition.start();
                            } catch {
                                // Already started, ignore
                            }
                        }
                    }, 100);
                } else {
                    this.onStatusChange('idle');
                }
            };

            this.recognition.onerror = (event) => {
                const errorMsg = this.getErrorMessage(event.error);

                // Some errors are recoverable
                if (event.error === 'no-speech' || event.error === 'aborted') {
                    // Just restart
                    return;
                }

                this.onError(errorMsg);
                if (event.error === 'not-allowed') {
                    this.isActive = false;
                    this.onStatusChange('error');
                }
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcript = result[0].transcript;

                    if (result.isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    this.onTranscript(finalTranscript.trim(), true);
                } else if (interimTranscript) {
                    this.onTranscript(interimTranscript, false);
                }
            };

            this.recognition.start();
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to start speech recognition';
            this.onError(msg);
            this.onStatusChange('error');
            return false;
        }
    }

    private getErrorMessage(error: string): string {
        const messages: Record<string, string> = {
            'no-speech': 'No speech detected',
            'audio-capture': 'Microphone not available',
            'not-allowed': 'Microphone permission denied',
            'network': 'Network error (requires internet for some browsers)',
            'aborted': 'Recognition aborted',
            'language-not-supported': 'Language not supported',
            'service-not-allowed': 'Speech service not allowed',
        };
        return messages[error] || `Speech recognition error: ${error}`;
    }

    stop(): void {
        this.isActive = false;

        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch {
                // Already stopped
            }
        }

        this.onStatusChange('idle');
    }

    pause(): void {
        // Set paused flag BEFORE stopping (onend will check this)
        this.isPaused = true;

        // Clear any pending restart
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }

        // Stop recognition
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch {
                // Already stopped
            }
        }

        this.onStatusChange('idle');
    }

    resume(): void {
        // Clear paused flag
        this.isPaused = false;

        // Restart if we were active
        if (this.isActive && this.recognition) {
            try {
                this.recognition.start();
                this.onStatusChange('listening');
            } catch {
                // Already started or other error
            }
        }
    }

    disconnect(): void {
        this.isPaused = false;
        this.stop();
        this.recognition = null;
    }
}
