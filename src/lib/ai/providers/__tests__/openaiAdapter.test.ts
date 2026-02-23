import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIAdapter } from '../OpenAIAdapter';

describe('OpenAIAdapter', () => {
    let adapter: OpenAIAdapter;

    beforeEach(() => {
        adapter = new OpenAIAdapter();
        global.fetch = vi.fn();
    });

    it('should send a chat request successfully', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                choices: [{ message: { content: 'Mock response' } }]
            })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const config = {
            apiKey: 'test-key',
            provider: 'openai',
            messages: [{ role: 'user', content: 'Hello' } as any]
        } as any;

        const result = await adapter.sendChatRequest(config);

        expect(result).toBe('Mock response');
        expect(global.fetch).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('test-key')
        }));
    });

    it('should throw an error on api failure', async () => {
        const mockResponse = {
            ok: false,
            json: async () => ({
                error: 'API Error test'
            })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const config = {
            apiKey: 'test-key',
            provider: 'openai',
            messages: []
        } as any;

        await expect(adapter.sendChatRequest(config)).rejects.toThrow('API Error test');
    });
});
