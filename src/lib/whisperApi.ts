// Whisper API Client — REST-based transcription fallback
// Uses whisper-1 model for users without Realtime API access (free tier)

export interface WhisperConfig {
    apiKey: string;
    language?: string;
}

export interface WhisperResult {
    text: string;
    duration?: number;
}

/**
 * Transcribe audio using the internal Whisper proxy (/api/ai/whisper).
 * The proxy forwards the request to OpenAI server-side.
 */
export async function transcribeWithWhisper(
    audioBlob: Blob,
    config: WhisperConfig
): Promise<WhisperResult> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('apiKey', config.apiKey);

    if (config.language) {
        formData.append('language', config.language);
    }

    const response = await fetch('/api/ai/whisper', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Whisper proxy error: ${response.status}`);
    }

    const result = await response.json();
    return {
        text: result.text || '',
        duration: result.duration,
    };
}

/**
 * Chunked audio recorder that accumulates audio and sends to Whisper
 */
export class WhisperTranscriber {
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private config: WhisperConfig;
    private onTranscript: (text: string, isFinal: boolean) => void;
    private onError: (error: string) => void;
    private onStatusChange: (status: 'idle' | 'recording' | 'transcribing' | 'error') => void;
    private isActive = false;
    private transcriptionInterval: ReturnType<typeof setInterval> | null = null;
    private accumulatedText = '';

    constructor(
        config: WhisperConfig,
        onTranscript: (text: string, isFinal: boolean) => void,
        onError: (error: string) => void,
        onStatusChange: (status: 'idle' | 'recording' | 'transcribing' | 'error') => void
    ) {
        this.config = config;
        this.onTranscript = onTranscript;
        this.onError = onError;
        this.onStatusChange = onStatusChange;
    }

    async start(stream: MediaStream): Promise<void> {
        if (this.isActive) return;
        this.isActive = true;
        this.accumulatedText = '';
        this.onStatusChange('recording');

        try {
            // Check for supported mime types
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            this.mediaRecorder = new MediaRecorder(stream, { mimeType });
            this.chunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.mediaRecorder.onerror = () => {
                this.onError('Recording error');
                this.onStatusChange('error');
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every 1 second

            // Set up periodic transcription (every 5 seconds)
            this.transcriptionInterval = setInterval(() => {
                this.transcribeCurrentChunks();
            }, 5000);

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to start recording';
            this.onError(msg);
            this.onStatusChange('error');
            this.isActive = false;
        }
    }

    private async transcribeCurrentChunks(): Promise<void> {
        if (this.chunks.length === 0) return;

        // Copy chunks and clear
        const chunksToProcess = [...this.chunks];
        this.chunks = [];

        try {
            this.onStatusChange('transcribing');

            const audioBlob = new Blob(chunksToProcess, { type: 'audio/webm' });

            // Only transcribe if we have enough audio (>1 second worth)
            if (audioBlob.size < 5000) {
                this.chunks = chunksToProcess; // Put back if too small
                this.onStatusChange('recording');
                return;
            }

            const result = await transcribeWithWhisper(audioBlob, this.config);

            if (result.text.trim()) {
                this.accumulatedText += (this.accumulatedText ? ' ' : '') + result.text.trim();
                this.onTranscript(result.text.trim(), false);
            }

            this.onStatusChange('recording');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Transcription failed';
            this.onError(msg);
            // Put chunks back for retry
            this.chunks = [...chunksToProcess, ...this.chunks];
            this.onStatusChange('recording');
        }
    }

    async stop(): Promise<string> {
        this.isActive = false;

        if (this.transcriptionInterval) {
            clearInterval(this.transcriptionInterval);
            this.transcriptionInterval = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        // Final transcription of remaining chunks
        if (this.chunks.length > 0) {
            await this.transcribeCurrentChunks();
        }

        this.onStatusChange('idle');
        return this.accumulatedText;
    }

    disconnect(): void {
        this.isActive = false;

        if (this.transcriptionInterval) {
            clearInterval(this.transcriptionInterval);
            this.transcriptionInterval = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        this.mediaRecorder = null;
        this.chunks = [];
        this.onStatusChange('idle');
    }
}
