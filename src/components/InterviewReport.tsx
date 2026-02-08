"use client";

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from './ui/Button';
import {
    CheckCircle2, XCircle, Lightbulb, RefreshCw, Download, Star, AlertTriangle,
    Zap, Brain, MessageSquare, Briefcase, BookOpen, Target, TrendingUp, Award,
    ChevronRight, GraduationCap, ThumbsUp, ThumbsDown, Clock, BarChart3, Settings
} from 'lucide-react';

// Score Bar Component with Animation
function ScoreBar({ score, label, icon: Icon, color, weight }: {
    score: number;
    label: string;
    icon: React.ElementType;
    color: string;
    weight: string;
}) {
    const colors = {
        green: { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600' },
        amber: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-600' },
        red: { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-600' },
        blue: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600' },
    };

    const scoreColor = score >= 70 ? 'green' : score >= 50 ? 'amber' : 'red';
    const c = colors[scoreColor];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${c.light}`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{weight} weight</p>
                </div>
                <span className={`text-2xl font-bold ${c.text}`}>{score}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full ${c.bg} rounded-full`}
                />
            </div>
        </motion.div>
    );
}

// Question Card Component
function QuestionCard({ qa, index }: { qa: any; index: number }) {
    const scoreColor = qa.score >= 70 ? 'green' : qa.score >= 50 ? 'amber' : 'red';
    const colors = {
        green: { ring: 'ring-green-200', bg: 'bg-green-50', text: 'text-green-600' },
        amber: { ring: 'ring-amber-200', bg: 'bg-amber-50', text: 'text-amber-600' },
        red: { ring: 'ring-red-200', bg: 'bg-red-50', text: 'text-red-600' },
    };
    const c = colors[scoreColor];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all ring-2 ${c.ring}`}
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                            Q{index + 1}
                        </span>
                        <h4 className="font-semibold text-slate-800">{qa.topic}</h4>
                    </div>
                </div>
                <div className={`px-3 py-2 rounded-xl ${c.bg} flex flex-col items-center`}>
                    <span className={`text-xl font-bold ${c.text}`}>{qa.score}</span>
                    <span className="text-xs text-slate-500">/100</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        <p className="text-slate-600 text-xs font-semibold uppercase">Your Answer</p>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{qa.candidateAnswer}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <p className="text-amber-600 text-xs font-semibold uppercase">Could Improve</p>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{qa.whatWasMissing}</p>
                </div>
            </div>
        </motion.div>
    );
}

interface InterviewReportProps {
    onOpenSettings: () => void;
}

export function InterviewReport({ onOpenSettings }: InterviewReportProps) {
    const { report, resetSession } = useAppStore();

    if (!report) return null;

    const getHiringBadge = (decision: string | undefined) => {
        const badges: Record<string, { color: string; label: string; icon: React.ElementType }> = {
            'STRONG_HIRE': { color: 'bg-gradient-to-r from-green-500 to-emerald-600', label: 'Strong Hire', icon: ThumbsUp },
            'HIRE': { color: 'bg-gradient-to-r from-green-400 to-green-500', label: 'Hire', icon: ThumbsUp },
            'LEAN_HIRE': { color: 'bg-gradient-to-r from-amber-400 to-amber-500', label: 'Lean Hire', icon: TrendingUp },
            'LEAN_NO_HIRE': { color: 'bg-gradient-to-r from-orange-400 to-orange-500', label: 'Lean No Hire', icon: TrendingUp },
            'NO_HIRE': { color: 'bg-gradient-to-r from-red-500 to-red-600', label: 'No Hire', icon: ThumbsDown },
        };
        return badges[decision || ''] || { color: 'bg-slate-500', label: 'Evaluated', icon: BarChart3 };
    };

    const hiringBadge = getHiringBadge(report.hiringDecision);
    const HiringIcon = hiringBadge.icon;

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-5xl mx-auto space-y-6"
            >
                {/* Header Card */}
                <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-10 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02djRoLTR2LTRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnY0aC00di00aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                        <div className="relative z-10 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                className="inline-block"
                            >
                                <Award className="w-16 h-16 mx-auto mb-4" />
                            </motion.div>
                            <h1 className="text-4xl font-bold mb-2">Interview Evaluation</h1>
                            <p className="text-white/80 text-lg">Technical Performance Report</p>
                        </div>
                    </div>

                    <div className="p-8 lg:p-10">
                        {/* Score Display */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 mb-12">
                            {/* Circle Score */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="relative"
                            >
                                <div className="w-48 h-48 relative">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            className="text-slate-200"
                                            strokeWidth="14"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="50"
                                            cx="64"
                                            cy="64"
                                        />
                                        <motion.circle
                                            initial={{ strokeDashoffset: 314 }}
                                            animate={{ strokeDashoffset: 314 - (314 * report.score) / 100 }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                            className={report.score >= 70 ? 'text-green-500' : report.score >= 50 ? 'text-amber-500' : 'text-red-500'}
                                            strokeWidth="14"
                                            strokeDasharray={314}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="50"
                                            cx="64"
                                            cy="64"
                                        />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className={`text-6xl font-bold ${report.score >= 70 ? 'text-green-600' : report.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}
                                        >
                                            {report.score}
                                        </motion.span>
                                        <span className="block text-sm text-slate-500 font-medium mt-1">OVERALL</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Hiring Decision */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center lg:text-left"
                            >
                                <span className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-xl ${hiringBadge.color} shadow-xl`}>
                                    <HiringIcon className="w-7 h-7" />
                                    {hiringBadge.label}
                                </span>
                                <p className="text-slate-500 text-sm mt-4 max-w-xs">
                                    Based on comprehensive analysis of technical skills, problem-solving, and communication
                                </p>
                            </motion.div>
                        </div>

                        {/* Score Bars */}
                        {(report.technicalScore !== undefined || report.problemSolvingScore !== undefined) && (
                            <div className="grid md:grid-cols-2 gap-4 mb-10">
                                {report.technicalScore !== undefined && (
                                    <ScoreBar score={report.technicalScore} label="Technical Knowledge" icon={Brain} color="blue" weight="40%" />
                                )}
                                {report.problemSolvingScore !== undefined && (
                                    <ScoreBar score={report.problemSolvingScore} label="Problem Solving" icon={Zap} color="blue" weight="25%" />
                                )}
                                {report.communicationScore !== undefined && (
                                    <ScoreBar score={report.communicationScore} label="Communication" icon={MessageSquare} color="blue" weight="20%" />
                                )}
                                {report.experienceScore !== undefined && (
                                    <ScoreBar score={report.experienceScore} label="Experience" icon={Briefcase} color="blue" weight="15%" />
                                )}
                            </div>
                        )}

                        {/* Executive Summary */}
                        <motion.div
                            variants={fadeInUp}
                            className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-2xl border border-slate-200 mb-8"
                        >
                            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2 text-lg">
                                <Star className="w-5 h-5 text-amber-500" /> Executive Summary
                            </h3>
                            <p className="text-slate-700 leading-relaxed">{report.feedback}</p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Question-by-Question Analysis */}
                {report.questionAnalysis && report.questionAnalysis.length > 0 && (
                    <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-8">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-800 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-xl">
                                <Target className="w-6 h-6 text-indigo-600" />
                            </div>
                            Question Analysis
                        </h3>
                        <div className="space-y-4">
                            {report.questionAnalysis.map((qa: any, idx: number) => (
                                <QuestionCard key={idx} qa={qa} index={idx} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Highlights & Critical Gaps */}
                <div className="grid md:grid-cols-2 gap-6">
                    {report.interviewHighlights && report.interviewHighlights.length > 0 && (
                        <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-green-700 mb-4">
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <Zap className="w-5 h-5 text-green-600" />
                                </div>
                                Best Moments
                            </h3>
                            <ul className="space-y-3">
                                {report.interviewHighlights.map((highlight: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-3 text-slate-700 bg-green-50 p-4 rounded-xl text-sm border border-green-100"
                                    >
                                        <span className="text-green-500 text-lg">★</span>
                                        <span>{highlight}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {report.criticalGaps && report.criticalGaps.length > 0 && (
                        <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-red-700 mb-4">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                Priority Improvements
                            </h3>
                            <ul className="space-y-3">
                                {report.criticalGaps.map((gap: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-3 text-slate-700 bg-red-50 p-4 rounded-xl text-sm border border-red-100"
                                    >
                                        <span className="text-red-500 text-lg">!</span>
                                        <span>{gap}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>

                {/* Strengths & Weaknesses */}
                <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 text-green-700 mb-4">
                                <CheckCircle2 className="w-5 h-5" /> Strengths
                            </h3>
                            <ul className="space-y-2">
                                {report.strengths.map((str: string, idx: number) => (
                                    <li key={idx} className="flex gap-3 text-slate-700 text-sm py-2">
                                        <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>{str}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 text-red-700 mb-4">
                                <XCircle className="w-5 h-5" /> Areas for Improvement
                            </h3>
                            <ul className="space-y-2">
                                {report.weaknesses.map((weak: string, idx: number) => (
                                    <li key={idx} className="flex gap-3 text-slate-700 text-sm py-2">
                                        <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <span>{weak}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Study Plan */}
                {report.studyPlan && report.studyPlan.length > 0 && (
                    <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-8">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-indigo-700 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-xl">
                                <GraduationCap className="w-6 h-6 text-indigo-600" />
                            </div>
                            Personalized Study Plan
                        </h3>
                        <div className="space-y-4">
                            {report.studyPlan.map((item: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-lg mb-2">{item.topic}</h4>
                                            <p className="text-slate-600 text-sm mb-3">{item.reason}</p>
                                            <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-indigo-100">
                                                <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                <p className="text-indigo-700 text-sm">{item.resources}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Action Plan & Next Interview Tips */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-amber-600 mb-4">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <Lightbulb className="w-5 h-5 text-amber-500" />
                            </div>
                            Action Plan
                        </h3>
                        <div className="space-y-3">
                            {report.suggestions.map((sugg: string, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-slate-700 text-sm flex gap-3"
                                >
                                    <span className="w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span>{sugg}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {report.nextInterviewTips && report.nextInterviewTips.length > 0 && (
                        <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600 mb-4">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                </div>
                                Next Interview Tips
                            </h3>
                            <ul className="space-y-3">
                                {report.nextInterviewTips.map((tip: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-3 text-slate-700 bg-blue-50 p-4 rounded-xl text-sm border border-blue-100"
                                    >
                                        <span className="text-blue-500 font-bold">→</span>
                                        <span>{tip}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>

                {/* Actions */}
                <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={resetSession} size="lg" className="px-10 py-4 text-lg">
                            <RefreshCw className="mr-2 w-5 h-5" /> New Interview
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => window.print()} className="px-10 py-4 text-lg">
                            <Download className="mr-2 w-5 h-5" /> Export PDF
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
