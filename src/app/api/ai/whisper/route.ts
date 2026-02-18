import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/whisper
 * Server-side proxy for OpenAI Whisper transcription.
 * Keeps the API key on the server side instead of exposing it in the browser.
 *
 * Expects: multipart/form-data with 'file' (audio blob) and 'apiKey' field.
 * Optional: 'language' field.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get('file') as File | null;
        const apiKey = formData.get('apiKey') as string | null;
        const language = formData.get('language') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 401 }
            );
        }

        // Build the request to OpenAI
        const openaiForm = new FormData();
        openaiForm.append('file', file, 'audio.webm');
        openaiForm.append('model', 'whisper-1');

        if (language) {
            openaiForm.append('language', language);
        }

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: openaiForm,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const message = errorBody?.error?.message || `Whisper API error: ${response.status}`;
            return NextResponse.json({ error: message }, { status: response.status });
        }

        const result = await response.json();

        return NextResponse.json({
            text: result.text || '',
            duration: result.duration,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[/api/ai/whisper] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
