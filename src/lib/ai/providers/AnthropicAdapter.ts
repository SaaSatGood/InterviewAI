import { AIProviderAdapter, ChatConfig } from './types';

export class AnthropicAdapter implements AIProviderAdapter {
    id = 'anthropic' as const;

    async sendChatRequest(config: ChatConfig): Promise<string> {
        // Send to backend proxy to hide API Key
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: config.apiKey,
                provider: this.id,
                model: config.model || 'claude-3-sonnet-20240229',
                systemPrompt: config.systemPrompt || '',
                messages: config.messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                })),
                temperature: config.temperature ?? 0.7
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch response from Anthropic backend proxy');
        }

        const data = await response.json();
        return data.content?.[0]?.text || '';
    }

    async generateReport(config: ChatConfig): Promise<string> {
        // Appending JSON instructions
        const reportPrompt = config.systemPrompt + '\n\nReturn ONLY valid JSON, no markdown.';
        return this.sendChatRequest({ ...config, systemPrompt: reportPrompt });
    }
}
