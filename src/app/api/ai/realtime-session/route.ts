import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey } = body;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key is required" }, { status: 401 });
        }

        // Request an ephemeral session token from OpenAI
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                modalities: ["text"],
                instructions: "You are an AI assistant." // Placeholders, the actual logic determines it in the client
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error?.message || "Failed to generate ephemeral session token" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Realtime Session Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error in Session Proxy" },
            { status: 500 }
        );
    }
}
