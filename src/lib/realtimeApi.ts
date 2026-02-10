// OpenAI Realtime API Client — WebSocket-based transcription
// Uses gpt-4o-realtime-preview for real-time audio processing

export interface RealtimeConfig {
    apiKey: string;
    model?: string;
    language?: string;
}

export interface TranscriptDelta {
    type: 'delta' | 'done';
    text: string;
    audioId?: string;
}

type OnTranscript = (delta: TranscriptDelta) => void;
type OnError = (error: string) => void;
type OnStatusChange = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

/**
 * Convert a Float32Array of audio samples to base64-encoded PCM16
 */
function float32ToBase64Pcm16(float32: Float32Array): string {
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(pcm16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export class RealtimeTranscriber {
    private ws: WebSocket | null = null;
    private config: RealtimeConfig;
    private onTranscript: OnTranscript;
    private onError: OnError;
    private onStatusChange: OnStatusChange;
    private audioProcessor: ScriptProcessorNode | null = null;
    private audioContext: AudioContext | null = null;
    private isActive = false;

    constructor(
        config: RealtimeConfig,
        onTranscript: OnTranscript,
        onError: OnError,
        onStatusChange: OnStatusChange
    ) {
        this.config = config;
        this.onTranscript = onTranscript;
        this.onError = onError;
        this.onStatusChange = onStatusChange;
    }

    async connect(stream: MediaStream): Promise<void> {
        if (this.isActive) return;
        this.isActive = true;
        this.onStatusChange('connecting');

        try {
            const model = this.config.model || 'gpt-4o-realtime-preview';
            const wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;

            this.ws = new WebSocket(wsUrl, [
                'realtime',
                `openai-insecure-api-key.${this.config.apiKey}`,
                'openai-beta.realtime-v1',
            ]);

            this.ws.onopen = () => {
                this.onStatusChange('connected');

                // Configure session for transcription-only
                // Note: input_audio_transcription uses whisper-1, not the connection model
                this.ws?.send(JSON.stringify({
                    type: 'session.update',
                    session: {
                        modalities: ['text'],
                        input_audio_transcription: {
                            model: 'whisper-1',
                            language: this.config.language || undefined,
                        },
                        turn_detection: {
                            type: 'server_vad',
                            threshold: 0.5,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 1000,
                        },
                    },
                }));

                // Start streaming audio
                this.startAudioStream(stream);
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    this.handleMessage(msg);
                } catch {
                    // Ignore malformed messages
                }
            };

            this.ws.onerror = () => {
                this.onError('WebSocket connection error');
                this.onStatusChange('error');
            };

            this.ws.onclose = () => {
                this.onStatusChange('disconnected');
                this.isActive = false;
            };
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to connect';
            this.onError(msg);
            this.onStatusChange('error');
            this.isActive = false;
        }
    }

    private handleMessage(msg: Record<string, unknown>) {
        switch (msg.type) {
            case 'conversation.item.input_audio_transcription.delta':
                this.onTranscript({
                    type: 'delta',
                    text: msg.delta as string || '',
                    audioId: msg.item_id as string,
                });
                break;

            case 'conversation.item.input_audio_transcription.completed':
                this.onTranscript({
                    type: 'done',
                    text: msg.transcript as string || '',
                    audioId: msg.item_id as string,
                });
                break;

            case 'error':
                this.onError(
                    (msg.error as Record<string, string>)?.message || 'Realtime API error'
                );
                break;
        }
    }

    private startAudioStream(stream: MediaStream) {
        this.audioContext = new AudioContext({ sampleRate: 24000 });
        const source = this.audioContext.createMediaStreamSource(stream);

        // Use ScriptProcessorNode (deprecated but widely supported)
        // AudioWorklet would be preferred but is more complex to set up
        this.audioProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.audioProcessor.onaudioprocess = (e) => {
            if (!this.isActive || this.ws?.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);
            const base64Audio = float32ToBase64Pcm16(inputData);

            this.ws?.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: base64Audio,
            }));
        };

        source.connect(this.audioProcessor);
        this.audioProcessor.connect(this.audioContext.destination);
    }

    disconnect() {
        this.isActive = false;
        this.audioProcessor?.disconnect();
        this.audioProcessor = null;
        this.audioContext?.close();
        this.audioContext = null;

        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            this.ws.close();
        }
        this.ws = null;
    }
}
