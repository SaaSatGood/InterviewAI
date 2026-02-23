import { AIProviderAdapter, ChatConfig } from './types';

export class GeminiAdapter implements AIProviderAdapter {
    id = 'gemini' as const;

    async sendChatRequest(config: ChatConfig): Promise<string> {
        let contents = config.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        if (contents.length > 0 && contents[contents.length - 1].role === 'model') {
            contents.push({ role: 'user', parts: [{ text: 'Please continue.' }] });
        }

        const mergedContents: typeof contents = [];
        for (const content of contents) {
            if (mergedContents.length > 0 && mergedContents[mergedContents.length - 1].role === content.role) {
                mergedContents[mergedContents.length - 1].parts[0].text += '\n\n' + content.parts[0].text;
            } else {
                mergedContents.push(content);
            }
        }

        const systemInstruction = config.systemPrompt ? { parts: [{ text: config.systemPrompt }] } : undefined;

        // Send to backend proxy to hide API Key
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: config.apiKey,
                provider: this.id,
                model: config.model || 'gemini-2.5-flash',
                messages: mergedContents,
                systemInstruction,
                temperature: config.temperature ?? 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch response from Gemini backend proxy');
        }

        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('Gemini returned no response from backend proxy.');
        }

        return data.candidates[0].content.parts[0].text;
    }

    async generateReport(config: ChatConfig): Promise<string> {
        const conversationSummary = config.messages.map((msg) =>
            `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`
        ).join('\n\n');

        const simplifiedPrompt = `${config.systemPrompt}\n\nCONVERSATION TO ANALYZE:\n${conversationSummary}\n\nGENERATE THE EVALUATION REPORT NOW. OUTPUT ONLY VALID JSON.`;

        // We tell the backend to use JSON mode specially for report
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: config.apiKey,
                provider: this.id,
                model: 'gemini-2.5-flash',
                messages: [{ role: 'user', parts: [{ text: simplifiedPrompt }] }],
                temperature: 0.3,
                isReport: true // Custom flag for backend routing
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to generate report from Gemini proxy');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
}
