import { Message } from '@/types';
import { Provider } from './store';

export interface ChatConfig {
    apiKey: string;
    provider: Provider;
    messages: Message[];
    systemPrompt?: string;
    model?: string; // Optional: allows dynamic model selection
}

// OpenAI Chat Completion
async function sendOpenAIRequest(config: ChatConfig): Promise<string> {
    const { apiKey, messages, systemPrompt } = config;

    const conversation = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: config.model || 'gpt-4-turbo-preview',
            messages: conversation,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Google Gemini Chat Completion
async function sendGeminiRequest(config: ChatConfig): Promise<string> {
    const { apiKey, messages, systemPrompt } = config;

    // Format messages for Gemini API
    let contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Gemini requires the conversation to end with a user message
    if (contents.length > 0 && contents[contents.length - 1].role === 'model') {
        contents.push({
            role: 'user',
            parts: [{ text: 'Please continue.' }]
        });
    }

    // Merge consecutive same-role messages
    const mergedContents: typeof contents = [];
    for (const content of contents) {
        if (mergedContents.length > 0 && mergedContents[mergedContents.length - 1].role === content.role) {
            mergedContents[mergedContents.length - 1].parts[0].text += '\n\n' + content.parts[0].text;
        } else {
            mergedContents.push(content);
        }
    }

    const systemInstruction = systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: mergedContents,
                systemInstruction,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch response from Gemini');
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini returned no response. The model may be unavailable or the request was blocked.');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Gemini response format is invalid or empty.');
    }

    return candidate.content.parts[0].text;
}

// Gemini Report Generation with JSON schema
async function sendGeminiReportRequest(config: ChatConfig): Promise<string> {
    const { apiKey, messages, systemPrompt } = config;

    // Create a simplified conversation summary for report generation
    const conversationSummary = messages.map((msg, idx) =>
        `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`
    ).join('\n\n');

    // Simplified prompt that focuses on getting valid JSON
    const simplifiedPrompt = `${systemPrompt}

CONVERSATION TO ANALYZE:
${conversationSummary}

GENERATE THE EVALUATION REPORT NOW. OUTPUT ONLY VALID JSON.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: simplifiedPrompt }]
                }],
                generationConfig: {
                    temperature: 0.3, // Lower temperature for more structured output
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json",
                },
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini Report API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to generate report from Gemini');
    }

    const data = await response.json();
    console.log('Gemini Report Response:', JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini returned no response for report generation.');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Gemini report response format is invalid.');
    }

    return candidate.content.parts[0].text;
}

// Anthropic Claude Chat Completion
async function sendAnthropicRequest(config: ChatConfig): Promise<string> {
    const { apiKey, messages, systemPrompt } = config;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: config.model || 'claude-3-sonnet-20240229',
            max_tokens: 2048,
            system: systemPrompt || '',
            messages: messages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            })),
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch response from Anthropic');
    }

    const data = await response.json();
    return data.content[0].text;
}

// Main dispatcher function
export async function sendChatRequest(config: ChatConfig): Promise<string> {
    if (!config.apiKey) throw new Error("API Key is missing");

    try {
        switch (config.provider) {
            case 'openai':
            case 'azure':
                return await sendOpenAIRequest(config);
            case 'gemini':
                return await sendGeminiRequest(config);
            case 'anthropic':
                return await sendAnthropicRequest(config);
            default:
                throw new Error(`Unsupported provider: ${config.provider}`);
        }
    } catch (error: any) {
        console.error("Chat API Error:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

// Report generation
export async function generateReport(config: ChatConfig): Promise<any> {
    if (!config.apiKey) throw new Error("API Key is missing");

    try {
        let responseText: string;

        switch (config.provider) {
            case 'openai':
            case 'azure':
                responseText = await sendOpenAIReportRequest(config);
                break;
            case 'gemini':
                // Use dedicated Gemini report function with JSON mode
                responseText = await sendGeminiReportRequest(config);
                break;
            case 'anthropic':
                const reportPrompt = config.systemPrompt + '\n\nReturn ONLY valid JSON, no markdown.';
                responseText = await sendAnthropicRequest({ ...config, systemPrompt: reportPrompt });
                break;
            default:
                throw new Error(`Unsupported provider: ${config.provider}`);
        }

        console.log('Raw report response:', responseText.substring(0, 500) + '...');

        // Clean up response and parse JSON
        let cleanedResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/\n?```/g, '')
            .trim();

        // Try to extract JSON if there's extra text
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
        }

        try {
            const parsed = JSON.parse(cleanedResponse);

            // Ensure required fields exist with defaults
            return {
                score: parsed.score ?? 50,
                hiringDecision: parsed.hiringDecision ?? 'LEAN_HIRE',
                feedback: parsed.feedback ?? 'Evaluation completed.',
                technicalScore: parsed.technicalScore,
                problemSolvingScore: parsed.problemSolvingScore,
                communicationScore: parsed.communicationScore,
                experienceScore: parsed.experienceScore,
                questionAnalysis: parsed.questionAnalysis ?? [],
                strengths: parsed.strengths ?? ['Completed the interview'],
                weaknesses: parsed.weaknesses ?? ['No specific weaknesses identified'],
                suggestions: parsed.suggestions ?? ['Continue practicing'],
                interviewHighlights: parsed.interviewHighlights ?? [],
                criticalGaps: parsed.criticalGaps ?? [],
                studyPlan: parsed.studyPlan ?? [],
                nextInterviewTips: parsed.nextInterviewTips ?? [],
            };
        } catch (parseError) {
            console.error('JSON Parse Error. Response was:', cleanedResponse);
            // Return a default report structure if parsing fails
            return {
                score: 50,
                hiringDecision: 'LEAN_HIRE',
                feedback: 'Report parsing failed. Please check the browser console for the raw response.',
                strengths: ['Completed the interview'],
                weaknesses: ['Report generation encountered an issue'],
                suggestions: ['Try again or check the console for debugging information']
            };
        }
    } catch (error: any) {
        console.error("Report Generation Error:", error);
        throw new Error(error.message || "Failed to generate interview report");
    }
}

// OpenAI-specific report generation with JSON mode
async function sendOpenAIReportRequest(config: ChatConfig): Promise<string> {
    const { apiKey, messages, systemPrompt } = config;

    const conversation = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: conversation,
            response_format: { type: "json_object" },
            temperature: 0.5,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate report');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
