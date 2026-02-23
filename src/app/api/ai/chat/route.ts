import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey, provider, model, messages, temperature, systemPrompt, systemInstruction, isReport, response_format } = body;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key is required" }, { status: 401 });
        }

        if (provider === 'gemini') {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const payload: any = {
                contents: messages,
                generationConfig: {
                    temperature: temperature ?? 0.7,
                    maxOutputTokens: isReport ? 8192 : 4096,
                }
            };
            if (systemInstruction) payload.systemInstruction = systemInstruction;
            if (isReport) payload.generationConfig.responseMimeType = "application/json";

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Gemini Error' }, { status: res.status });
            return NextResponse.json(data);
        }

        if (provider === 'anthropic') {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: model || 'claude-3-sonnet-20240229',
                    max_tokens: 4096,
                    system: systemPrompt || '',
                    messages: messages,
                    temperature: temperature ?? 0.7
                }),
            });
            const data = await res.json();
            if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Anthropic Error' }, { status: res.status });
            return NextResponse.json(data);
        }

        // Default: OpenAI / Azure
        const payload: any = {
            model: model || 'gpt-4-turbo-preview',
            messages: messages,
            temperature: temperature ?? 0.7,
        };
        if (response_format) payload.response_format = response_format;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json(
                { error: data.error?.message || 'OpenAI Error' },
                { status: res.status }
            );
        }
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("API Chat Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error in Chat Proxy" },
            { status: 500 }
        );
    }
}
