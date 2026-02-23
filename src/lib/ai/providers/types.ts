import { Message } from '@/types';
import { Provider } from '@/lib/store';

export interface ChatConfig {
    apiKey: string;
    provider: Provider;
    messages: Message[];
    systemPrompt?: string;
    model?: string;
    temperature?: number;
}

export interface AIProviderAdapter {
    id: Provider;
    sendChatRequest(config: ChatConfig): Promise<string>;
    generateReport(config: ChatConfig): Promise<string>;
}
