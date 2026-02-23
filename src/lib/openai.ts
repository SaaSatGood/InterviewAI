import { ChatConfig } from './ai/providers/types';
import { OpenAIAdapter } from './ai/providers/OpenAIAdapter';
import { GeminiAdapter } from './ai/providers/GeminiAdapter';
import { AnthropicAdapter } from './ai/providers/AnthropicAdapter';
import { Provider } from '@/lib/store';
import { auth } from '@/lib/firebase/config';
import { updateUserTokenUsage } from '@/lib/firebase/firestore';

// Helper to get the respective adapter
function getAdapter(provider: Provider) {
    switch (provider) {
        case 'openai':
        case 'azure':
            return new OpenAIAdapter();
        case 'gemini':
            return new GeminiAdapter();
        case 'anthropic':
            return new AnthropicAdapter();
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

// Main dispatcher function
export async function sendChatRequest(config: ChatConfig): Promise<string> {
    if (!config.apiKey) throw new Error("API Key is missing");

    try {
        const adapter = getAdapter(config.provider);
        const response = await adapter.sendChatRequest(config);

        try {
            const user = auth.currentUser;
            if (user) {
                const reqChars = JSON.stringify(config.messages).length + (config.systemPrompt?.length || 0);
                const resChars = response.length;
                const approxTokens = Math.ceil((reqChars + resChars) / 4);
                // fire & forget
                updateUserTokenUsage(user.uid, approxTokens).catch(() => { });
            }
        } catch (e) {
            // ignore tracking errors
        }

        return response;
    } catch (error: any) {
        console.error("Chat API Error:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

// Report generation
export async function generateReport(config: ChatConfig): Promise<any> {
    if (!config.apiKey) throw new Error("API Key is missing");

    try {
        const adapter = getAdapter(config.provider);
        const responseText = await adapter.generateReport(config);

        try {
            const user = auth.currentUser;
            if (user) {
                const reqChars = JSON.stringify(config.messages).length + (config.systemPrompt?.length || 0);
                const resChars = responseText.length;
                const approxTokens = Math.ceil((reqChars + resChars) / 4);
                // fire & forget
                updateUserTokenUsage(user.uid, approxTokens).catch(() => { });
            }
        } catch (e) {
            // ignore tracking errors
        }

        console.log('Raw report response:', responseText.substring(0, 500) + '...');

        // Clean up response and parse JSON
        let cleanedResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/\n?```/g, '')
            .trim();

        // 1. Try to extract JSON if there's extra text
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
        }

        // 2. Remove any control characters that might break JSON.parse
        cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

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
            // Fallback: Try to fix common trailing comma issue (simple regex)
            try {
                const fixedJson = cleanedResponse.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
                const parsed = JSON.parse(fixedJson);
                // Return structured data if fix worked... (simplified for brevity)
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
            } catch (secondError) {
                console.error('JSON Parse Error. Response was:', cleanedResponse);
                return {
                    score: 50,
                    hiringDecision: 'LEAN_HIRE',
                    feedback: 'Report parsing failed. The AI response could not be processed.',
                    strengths: ['Completed the interview'],
                    weaknesses: ['Report generation encountered an issue'],
                    suggestions: ['Try again or check the console for debugging information']
                };
            }
        }
    } catch (error: any) {
        console.error("Report Generation Error:", error);
        throw new Error(error.message || "Failed to generate interview report");
    }
}
