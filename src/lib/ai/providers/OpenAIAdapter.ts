import { AIProviderAdapter, ChatConfig } from './types';

export class OpenAIAdapter implements AIProviderAdapter {
    id = 'openai' as const;

    async sendChatRequest(config: ChatConfig): Promise<string> {
        const { apiKey, messages, systemPrompt } = config;
        const conversation = [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages
        ];

        // Route calls to backend instead of raw api.openai
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                provider: this.id, // For the backend proxy to know how to route
                model: config.model || 'gpt-4-turbo-preview',
                messages: conversation,
                temperature: config.temperature ?? 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch response from backend OpenAI proxy');
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async generateReport(config: ChatConfig): Promise<string> {
        const { apiKey, messages, systemPrompt } = config;
        const conversation = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                provider: this.id,
                model: 'gpt-4-turbo-preview',
                messages: conversation,
                response_format: { type: "json_object" },
                temperature: 0.5,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate report via backend proxy');
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
}
