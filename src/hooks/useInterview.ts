import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { sendChatRequest, generateReport } from '@/lib/openai';
import { generateSystemPrompt, generateReportPrompt } from '@/lib/prompts';
import { Message, InterviewHistoryEntry } from '@/types';

export function useInterview() {
    const { getActiveKey, userProfile, language, resumeData, jobContext, addToHistory } = useAppStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialized = useRef(false);

    const activeKey = getActiveKey();

    const sendMessage = useCallback(async (content: string) => {
        if (!activeKey || !userProfile) return;

        const newMessage: Message = { role: 'user', content, timestamp: Date.now() };

        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setIsLoading(true);
        setError(null);

        try {
            const systemPrompt = generateSystemPrompt(userProfile, language, {
                resumeData,
                jobContext,
            });

            const responseContent = await sendChatRequest({
                apiKey: activeKey.key,
                provider: activeKey.provider,
                messages: newMessages,
                systemPrompt
            });

            const assistantMessage: Message = { role: 'assistant', content: responseContent, timestamp: Date.now() };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            setError(err.message || "Failed to send message");
        } finally {
            setIsLoading(false);
        }
    }, [activeKey, userProfile, messages, language, resumeData, jobContext]);

    // Initial greeting
    useEffect(() => {
        if (!initialized.current && activeKey && userProfile) {
            initialized.current = true;

            const startInterview = async () => {
                setIsLoading(true);
                try {
                    const responseContent = await sendChatRequest({
                        apiKey: activeKey.key,
                        provider: activeKey.provider,
                        messages: [{ role: 'user', content: "Please introduce yourself and start the interview." }],
                        systemPrompt: generateSystemPrompt(userProfile, language, {
                            resumeData,
                            jobContext,
                        })
                    });

                    setMessages([{ role: 'assistant', content: responseContent, timestamp: Date.now() }]);
                } catch (err: any) {
                    setError(err.message || "Failed to start interview");
                } finally {
                    setIsLoading(false);
                }
            };

            startInterview();
        }
    }, [activeKey, userProfile, language, resumeData, jobContext]);

    const finishInterview = async () => {
        if (!activeKey || !userProfile || messages.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const prompt = generateReportPrompt(userProfile, language);
            const reportData = await generateReport({
                apiKey: activeKey.key,
                provider: activeKey.provider,
                messages,
                systemPrompt: prompt
            });

            const { setReport } = useAppStore.getState();
            setReport(reportData);

            // Save to history
            const historyEntry: InterviewHistoryEntry = {
                id: crypto.randomUUID(),
                date: Date.now(),
                position: userProfile.position,
                stacks: userProfile.stacks,
                level: userProfile.level,
                score: reportData.score,
                hiringDecision: reportData.hiringDecision,
                report: reportData
            };
            addToHistory(historyEntry);

        } catch (err: any) {
            setError(err.message || "Failed to generate report");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        finishInterview
    };
}
