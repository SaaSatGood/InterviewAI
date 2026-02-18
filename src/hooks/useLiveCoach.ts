// Live Coach Hook — Pipeline: transcription → AI coaching → tips
// Debounced analysis with streaming response

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { sendChatRequest } from '@/lib/openai';
import { buildCoachPrompt, CoachTip } from '@/lib/prompts-coach';
import { TranscriptSegment } from './useTranscription';

interface LiveCoachState {
    tips: CoachTip[];
    isAnalyzing: boolean;
    lastAnalyzedAt: number | null;
    error: string | null;
}

interface LiveCoachReturn extends LiveCoachState {
    analyzeTranscript: (segments: TranscriptSegment[]) => void;
    clearTips: () => void;
}

const DEBOUNCE_MS = 2000;           // Wait 2s after speech stops
const MIN_TRANSCRIPT_LENGTH = 20;    // Min chars to trigger analysis
const MAX_CONTEXT_SEGMENTS = 20;     // Keep last 20 segments (~60s)

export function useLiveCoach(): LiveCoachReturn {
    const { getActiveKey, language, resumeData, jobContext, selectedModel } = useAppStore();
    const [state, setState] = useState<LiveCoachState>({
        tips: [],
        isAnalyzing: false,
        lastAnalyzedAt: null,
        error: null,
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTranscriptRef = useRef<string>('');

    const analyzeTranscript = useCallback((segments: TranscriptSegment[]) => {
        // Debounce — wait for pause in speech
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const activeKey = getActiveKey();
            if (!activeKey) return;

            // Build recent transcript text
            const recentSegments = segments.slice(-MAX_CONTEXT_SEGMENTS);
            const transcriptText = recentSegments
                .map(s => {
                    const label = s.speaker === 'recruiter' ? '🟦 Recruiter'
                        : s.speaker === 'candidate' ? '🟩 Candidate'
                            : '⬜ Unknown';
                    return `${label}: ${s.text}`;
                })
                .join('\n');

            // Skip if transcript hasn't changed meaningfully
            if (transcriptText === lastTranscriptRef.current) return;
            if (transcriptText.length < MIN_TRANSCRIPT_LENGTH) {
                console.log('[LiveCoach] Transcript too short:', transcriptText.length);
                return;
            }

            lastTranscriptRef.current = transcriptText;
            setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
            console.log('[LiveCoach] Analyzing...', { length: transcriptText.length, mode: useAppStore.getState().aiMode });

            try {
                const { systemPrompt, userMessage } = buildCoachPrompt(
                    language,
                    resumeData,
                    jobContext,
                    transcriptText,
                    useAppStore.getState().aiMode
                );

                // Determine best model: use selected or smart default
                const model = selectedModel || (activeKey.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o');

                const response = await sendChatRequest({
                    apiKey: activeKey.key,
                    provider: activeKey.provider,
                    model,
                    messages: [{ role: 'user', content: userMessage }],
                    systemPrompt,
                    temperature: 0.7, // Add temperature for creativity
                });

                console.log('[LiveCoach] Raw Response:', response);

                // Parse JSON response safely handling markdown code blocks
                let cleanJson = response.trim();
                // Remove markdown code blocks if present
                if (cleanJson.startsWith('```')) {
                    cleanJson = cleanJson.replace(/^```(json)?/, '').replace(/```$/, '');
                }

                // Find JSON object boundaries
                const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]) as Omit<CoachTip, 'timestamp' | 'questionText'>;

                    // Validate basic structure
                    if (!parsed.tips || !Array.isArray(parsed.tips)) {
                        console.error('[LiveCoach] Invalid JSON structure:', parsed);
                        throw new Error('Invalid response structure');
                    }

                    const tip: CoachTip = {
                        ...parsed,
                        timestamp: Date.now(),
                        questionText: extractLastQuestion(recentSegments),
                    };

                    console.log('[LiveCoach] Insight generated:', tip);

                    setState(prev => ({
                        ...prev,
                        tips: [...prev.tips, tip],
                        isAnalyzing: false,
                        lastAnalyzedAt: Date.now(),
                    }));
                } else {
                    console.warn('[LiveCoach] No JSON found in response');
                    throw new Error('No JSON found in response');
                }
            } catch (err: unknown) {
                console.error('[LiveCoach] Error:', err);
                let errorMsg = 'Falha na análise';

                if (err instanceof Error) {
                    const msg = err.message.toLowerCase();

                    // Quota/Rate limit errors
                    if (msg.includes('quota') || msg.includes('rate') || msg.includes('limit')) {
                        errorMsg = '⚠️ Limite de requisições excedido. Aguarde alguns segundos ou verifique seu plano de API.';
                    }
                    // Insufficient quota (billing)
                    else if (msg.includes('insufficient') || msg.includes('billing')) {
                        errorMsg = '💳 Créditos insuficientes. Configure o faturamento na sua conta da API.';
                    }
                    // Authentication errors
                    else if (msg.includes('auth') || msg.includes('key') || msg.includes('invalid') || msg.includes('401') || msg.includes('403')) {
                        errorMsg = '🔑 API Key inválida ou expirada. Verifique sua chave nas configurações.';
                    }
                    // Model not found
                    else if (msg.includes('model') || msg.includes('not found') || msg.includes('not supported')) {
                        errorMsg = '🤖 Modelo não disponível. Tente usar outro provedor de API.';
                    }
                    // Network errors
                    else if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
                        errorMsg = '🌐 Erro de conexão. Verifique sua internet.';
                    }
                    // Default: show original message
                    else {
                        errorMsg = `❌ ${err.message}`;
                    }
                }

                setState(prev => ({ ...prev, isAnalyzing: false, error: errorMsg }));
            }
        }, DEBOUNCE_MS);
    }, [getActiveKey, language, resumeData, jobContext, selectedModel]);

    const clearTips = useCallback(() => {
        setState({ tips: [], isAnalyzing: false, lastAnalyzedAt: null, error: null });
        lastTranscriptRef.current = '';
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return { ...state, analyzeTranscript, clearTips };
}

/**
 * Extract the last question from transcript segments (from recruiter)
 */
function extractLastQuestion(segments: TranscriptSegment[]): string | undefined {
    for (let i = segments.length - 1; i >= 0; i--) {
        const text = segments[i].text;
        if (segments[i].speaker === 'recruiter' && text.includes('?')) {
            return text;
        }
    }
    return undefined;
}
