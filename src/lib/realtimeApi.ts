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
    private audioContext: AudioContext | null = null;
    private audioWorkletNode: AudioWorkletNode | null = null;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
    private isActive = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
    private lastMessageAt = 0;

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
            await this.connectWebSocket();
            await this.startAudioStream(stream);
        } catch (err: unknown) {
            this.handleConnectionError(err);
        }
    }

    private async connectWebSocket(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const model = this.config.model || 'gpt-4o-realtime-preview';
            const wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;

            try {
                // Securely request Ephemeral Session Token from Backend
                const sessionRes = await fetch('/api/ai/realtime-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: this.config.apiKey })
                });

                if (!sessionRes.ok) {
                    throw new Error('Failed to acquire session token');
                }
                const sessionData = await sessionRes.json();
                const ephemeralToken = sessionData.client_secret.value;

                // Use the ephemeral token for the secure subprotocol
                this.ws = new WebSocket(wsUrl, [
                    'realtime',
                    `openai-insecure-api-key.${ephemeralToken}`,
                    'openai-beta.realtime-v1',
                ]);

                this.ws.onopen = () => {
                    this.reconnectAttempts = 0;
                    this.onStatusChange('connected');

                    // Configure session for transcription-only
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
                    resolve();

                    // Start health check — detect stale connections
                    this.startHealthCheck();
                };

                this.ws.onmessage = (event) => {
                    this.lastMessageAt = Date.now();
                    try {
                        const msg = JSON.parse(event.data);
                        this.handleMessage(msg);
                    } catch {
                        // Ignore malformed messages
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    // Don't reject here instantly, let onclose handle it or specific timeout
                };

                this.ws.onclose = () => {
                    if (this.isActive) {
                        this.onStatusChange('disconnected');
                        this.attemptReconnect();
                    }
                };
            } catch (err) {
                reject(err);
            }
        });
    }

    private handleConnectionError(err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to connect';
        this.onError(msg);
        this.onStatusChange('error');
        this.isActive = false;
    }

    private attemptReconnect() {
        if (!this.isActive || this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.isActive = false;
            this.onStatusChange('error');
            this.onError('Connection lost and could not be restored');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

        console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        this.reconnectTimeout = setTimeout(async () => {
            try {
                await this.connectWebSocket();
                // If audio context exists, we might need to verify it's still running
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
            } catch (err) {
                // Reconnect failed, it will trigger onclose again or we assume it failed
                console.error('Reconnect failed', err);
            }
        }, delay);
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
                // Check if it's a fatal error or transient
                const errorMsg = (msg.error as Record<string, string>)?.message || 'Realtime API error';
                console.error('Realtime API error:', errorMsg);
                this.onError(errorMsg);
                break;
        }
    }

    private async startAudioStream(stream: MediaStream) {
        this.audioContext = new AudioContext({ sampleRate: 24000 });

        try {
            await this.audioContext.audioWorklet.addModule('/audio-processor.js');
        } catch (e) {
            console.error('Failed to load audio-processor.js, falling back or failing', e);
            throw new Error('Failed to load audio processor worklet');
        }

        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');

        this.audioWorkletNode.port.onmessage = (event) => {
            if (event.data.event === 'audio' && this.ws?.readyState === WebSocket.OPEN) {
                const float32Buffer = event.data.buffer;
                const base64Audio = float32ToBase64Pcm16(float32Buffer);

                this.ws.send(JSON.stringify({
                    type: 'input_audio_buffer.append',
                    audio: base64Audio,
                }));
            }
        };

        this.mediaStreamSource.connect(this.audioWorkletNode);
        this.audioWorkletNode.connect(this.audioContext.destination);
    }

    disconnect() {
        this.isActive = false;
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        this.mediaStreamSource?.disconnect();
        this.audioWorkletNode?.disconnect();
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }

        this.mediaStreamSource = null;
        this.audioWorkletNode = null;
        this.audioContext = null;

        if (this.ws) {
            this.ws.onclose = null; // Prevent reconnect on manual disconnect
            this.ws.close();
        }
        this.ws = null;
    }

    /**
     * Periodically check if the WebSocket is still alive.
     * If no message received for 30s while connected, trigger reconnect.
     */
    private startHealthCheck() {
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        this.lastMessageAt = Date.now();

        this.healthCheckInterval = setInterval(() => {
            if (!this.isActive || !this.ws) return;

            const silenceDuration = Date.now() - this.lastMessageAt;

            // If no message for 30 seconds on an open connection, reconnect
            if (silenceDuration > 30000 && this.ws.readyState === WebSocket.OPEN) {
                console.warn('[Realtime] Connection appears stale, reconnecting...');
                this.ws.close(); // This will trigger onclose -> attemptReconnect()
            }
        }, 10000);
    }
}
