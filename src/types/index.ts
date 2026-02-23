export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: number;
    status?: 'error';
}

export interface QuestionAnalysis {
    topic: string;
    candidateAnswer: string;
    score: number;
    whatWasMissing: string;
}

export interface StudyPlanItem {
    topic: string;
    reason: string;
    resources: string;
}

export interface InterviewReport {
    score: number;
    hiringDecision?: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'LEAN_NO_HIRE' | 'NO_HIRE';
    feedback: string;
    technicalScore?: number;
    problemSolvingScore?: number;
    communicationScore?: number;
    experienceScore?: number;
    questionAnalysis?: QuestionAnalysis[];
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    interviewHighlights?: string[];
    criticalGaps?: string[];
    studyPlan?: StudyPlanItem[];
    nextInterviewTips?: string[];
}

export interface InterviewHistoryEntry {
    id: string;
    date: number;
    position: string;
    stacks: string[];
    level: string;
    score: number;
    hiringDecision?: string;
    report: InterviewReport;
}

export interface InterviewState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
}
