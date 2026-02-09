"use client";

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from './ui/Button';
import {
    CheckCircle2, XCircle, Lightbulb, RefreshCw, Download, AlertTriangle,
    Zap, Brain, MessageSquare, Briefcase, BookOpen, Target, TrendingUp, Award,
    ChevronRight, GraduationCap, ThumbsUp, ThumbsDown, BarChart3, ArrowRight, Sparkles
} from 'lucide-react';

// Score Bar Component - Consistent design
function ScoreBar({ score, label, icon: Icon, weight }: {
    score: number;
    label: string;
    icon: React.ElementType;
    weight: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-800 hover:border-neutral-700 transition-all"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/5">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-100 text-sm sm:text-base truncate">{label}</p>
                    <p className="text-xs text-neutral-500">{weight}</p>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">{score}</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-white/60 to-white/90 rounded-full"
                />
            </div>
        </motion.div>
    );
}

// Question Card Component
function QuestionCard({ qa, index, t }: { qa: any; index: number; t: (key: string) => string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-neutral-800 hover:border-neutral-700 transition-all"
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-white/10 text-white text-xs font-bold rounded-full shrink-0">
                            Q{index + 1}
                        </span>
                        <h4 className="font-semibold text-neutral-100 text-sm sm:text-base">{qa.topic}</h4>
                    </div>
                </div>
                <div className="px-3 py-2 rounded-xl bg-white/5 flex flex-row sm:flex-col items-center gap-2 sm:gap-0 border border-neutral-800 self-start">
                    <span className="text-lg sm:text-xl font-bold text-white">{qa.score}</span>
                    <span className="text-xs text-neutral-500">/100</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-neutral-800/50 p-3 sm:p-4 rounded-lg border border-neutral-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-neutral-500 shrink-0" />
                        <p className="text-neutral-400 text-xs font-semibold uppercase">{t('report.yourAnswer')}</p>
                    </div>
                    <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">{qa.candidateAnswer}</p>
                </div>
                <div className="bg-neutral-800/30 p-3 sm:p-4 rounded-lg border border-neutral-700/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-neutral-400 shrink-0" />
                        <p className="text-neutral-400 text-xs font-semibold uppercase">{t('report.couldImprove')}</p>
                    </div>
                    <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">{qa.whatWasMissing}</p>
                </div>
            </div>
        </motion.div>
    );
}

interface InterviewReportProps {
    onOpenSettings: () => void;
}

export function InterviewReport({ onOpenSettings }: InterviewReportProps) {
    const { report, resetSession, t } = useAppStore();

    if (!report) return null;

    const getHiringBadge = (decision: string | undefined) => {
        const badges: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
            'STRONG_HIRE': { bg: 'bg-white text-neutral-900', label: t('hiring.strongHire'), icon: ThumbsUp },
            'HIRE': { bg: 'bg-white/90 text-neutral-900', label: t('hiring.hire'), icon: ThumbsUp },
            'LEAN_HIRE': { bg: 'bg-white/70 text-neutral-900', label: t('hiring.leanHire'), icon: TrendingUp },
            'LEAN_NO_HIRE': { bg: 'bg-neutral-700 text-white', label: t('hiring.leanNoHire'), icon: TrendingUp },
            'NO_HIRE': { bg: 'bg-neutral-800 text-neutral-300', label: t('hiring.noHire'), icon: ThumbsDown },
        };
        return badges[decision || ''] || { bg: 'bg-neutral-700 text-white', label: 'Evaluated', icon: BarChart3 };
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
        <div className="min-h-screen bg-neutral-950 py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
            {/* Background effects - same as landing page */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[600px] bg-white/[0.02] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-white/[0.01] rounded-full blur-3xl"></div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-5xl mx-auto space-y-4 sm:space-y-6 relative z-10"
            >
                {/* Header Card */}
                <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden">
                        {/* Animated background pattern */}
                        <motion.div
                            className="absolute inset-0 opacity-10"
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 100%'],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                repeatType: 'reverse',
                            }}
                            style={{
                                backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02djRoLTR2LTRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnY0aC00di00aDR6Ii8+PC9nPjwvZz48L3N2Zz4=")',
                                backgroundSize: '60px 60px',
                            }}
                        />
                        <div className="relative z-10 text-center">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                className="inline-block"
                            >
                                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/20">
                                    <Award className="w-7 h-7 sm:w-10 sm:h-10" />
                                </div>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2"
                            >
                                {t('report.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-white/60 text-sm sm:text-base lg:text-lg"
                            >
                                {t('report.subtitle')}
                            </motion.p>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-10">
                        {/* Score Display */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
                            {/* Circle Score */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="relative"
                            >
                                <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 relative">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            className="text-neutral-800"
                                            strokeWidth="12"
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
                                            className="text-white"
                                            strokeWidth="12"
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
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, type: 'spring' }}
                                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
                                        >
                                            {report.score}
                                        </motion.span>
                                        <span className="block text-xs sm:text-sm text-neutral-500 font-medium mt-1 uppercase">{t('report.overall')}</span>
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
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative inline-block"
                                >
                                    <span className={`relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl ${hiringBadge.bg} shadow-xl`}>
                                        <HiringIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                                        {hiringBadge.label}
                                    </span>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Score Bars */}
                        {(report.technicalScore !== undefined || report.problemSolvingScore !== undefined) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
                                {report.technicalScore !== undefined && (
                                    <ScoreBar score={report.technicalScore} label={t('score.technical')} icon={Brain} weight="40%" />
                                )}
                                {report.problemSolvingScore !== undefined && (
                                    <ScoreBar score={report.problemSolvingScore} label={t('score.problemSolving')} icon={Zap} weight="25%" />
                                )}
                                {report.communicationScore !== undefined && (
                                    <ScoreBar score={report.communicationScore} label={t('score.communication')} icon={MessageSquare} weight="20%" />
                                )}
                                {report.experienceScore !== undefined && (
                                    <ScoreBar score={report.experienceScore} label={t('score.experience')} icon={Briefcase} weight="15%" />
                                )}
                            </div>
                        )}

                        {/* Executive Summary */}
                        <motion.div
                            variants={fadeInUp}
                            className="bg-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-800 mb-6 sm:mb-8"
                        >
                            <h3 className="text-neutral-100 font-bold mb-2 sm:mb-3 flex items-center gap-2 text-base sm:text-lg">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" /> {t('report.summary')}
                            </h3>
                            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">{report.feedback}</p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Question-by-Question Analysis */}
                {report.questionAnalysis && report.questionAnalysis.length > 0 && (
                    <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6 lg:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-neutral-100 mb-4 sm:mb-6">
                            <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg sm:rounded-xl">
                                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                            </div>
                            {t('report.questionAnalysis')}
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                            {report.questionAnalysis.map((qa: any, idx: number) => (
                                <QuestionCard key={idx} qa={qa} index={idx} t={t} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Highlights & Critical Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {report.interviewHighlights && report.interviewHighlights.length > 0 && (
                        <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-neutral-100 mb-3 sm:mb-4">
                                <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg sm:rounded-xl">
                                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                                </div>
                                {t('report.bestMoments')}
                            </h3>
                            <ul className="space-y-2 sm:space-y-3">
                                {report.interviewHighlights.map((highlight: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ x: 4 }}
                                        className="flex gap-2 sm:gap-3 text-neutral-300 bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm border border-neutral-800"
                                    >
                                        <span className="text-white text-base sm:text-lg shrink-0">★</span>
                                        <span>{highlight}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {report.criticalGaps && report.criticalGaps.length > 0 && (
                        <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-neutral-100 mb-3 sm:mb-4">
                                <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg sm:rounded-xl">
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                                </div>
                                {t('report.priorityImprovements')}
                            </h3>
                            <ul className="space-y-2 sm:space-y-3">
                                {report.criticalGaps.map((gap: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ x: 4 }}
                                        className="flex gap-2 sm:gap-3 text-neutral-300 bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm border border-neutral-800"
                                    >
                                        <span className="text-neutral-400 text-base sm:text-lg shrink-0">!</span>
                                        <span>{gap}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>

                {/* Strengths & Weaknesses */}
                <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-neutral-100 mb-3 sm:mb-4">
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300" /> {t('report.strengths')}
                            </h3>
                            <ul className="space-y-2">
                                {report.strengths.map((str: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        whileHover={{ x: 4 }}
                                        className="flex gap-2 sm:gap-3 text-neutral-300 text-xs sm:text-sm py-2"
                                    >
                                        <ChevronRight className="w-4 h-4 text-white mt-0.5 shrink-0" />
                                        <span>{str}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-neutral-100 mb-3 sm:mb-4">
                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" /> {t('report.weaknesses')}
                            </h3>
                            <ul className="space-y-2">
                                {report.weaknesses.map((weak: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        whileHover={{ x: 4 }}
                                        className="flex gap-2 sm:gap-3 text-neutral-300 text-xs sm:text-sm py-2"
                                    >
                                        <ChevronRight className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                                        <span>{weak}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Study Plan */}
                {report.studyPlan && report.studyPlan.length > 0 && (
                    <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6 lg:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-neutral-100 mb-4 sm:mb-6">
                            <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg sm:rounded-xl">
                                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                            </div>
                            {t('report.studyPlan')}
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                            {report.studyPlan.map((item: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-800"
                                >
                                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-neutral-900 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shadow-lg shrink-0"
                                        >
                                            {idx + 1}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-neutral-100 text-base sm:text-lg mb-1 sm:mb-2">{item.topic}</h4>
                                            <p className="text-neutral-400 text-xs sm:text-sm mb-2 sm:mb-3">{item.reason}</p>
                                            <div className="flex items-start gap-2 bg-neutral-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-neutral-700/50">
                                                <BookOpen className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                                                <p className="text-neutral-300 text-xs sm:text-sm">{item.resources}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Action Plan & Next Interview Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-neutral-100 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg sm:rounded-xl">
                                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                            </div>
                            {t('report.actionPlan')}
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                            {report.suggestions.map((sugg: string, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ x: 4 }}
                                    className="bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-neutral-800 text-neutral-300 text-xs sm:text-sm flex gap-2 sm:gap-3"
                                >
                                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-white text-neutral-900 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span>{sugg}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {report.nextInterviewTips && report.nextInterviewTips.length > 0 && (
                        <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-neutral-100 mb-3 sm:mb-4">
                                <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg sm:rounded-xl">
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                                </div>
                                {t('report.nextTips')}
                            </h3>
                            <ul className="space-y-2 sm:space-y-3">
                                {report.nextInterviewTips.map((tip: string, idx: number) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ x: 4 }}
                                        className="flex gap-2 sm:gap-3 text-neutral-300 bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm border border-neutral-800"
                                    >
                                        <span className="text-white font-bold shrink-0">→</span>
                                        <span>{tip}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>

                {/* Actions */}
                <motion.div variants={fadeInUp} className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        {/* Animated New Interview Button */}
                        <motion.div
                            className="relative inline-block w-full sm:w-auto"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-white/20 rounded-lg blur-lg opacity-50"
                                animate={{
                                    opacity: [0.3, 0.5, 0.3],
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <Button onClick={resetSession} size="lg" className="relative w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg overflow-hidden group bg-white text-neutral-900 hover:bg-neutral-100">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent -skew-x-12"
                                    animate={{ x: ['-200%', '200%'] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                        ease: "easeInOut",
                                    }}
                                />
                                <RefreshCw className="mr-2 w-4 h-4 sm:w-5 sm:h-5 relative" />
                                <span className="relative">{t('report.newInterview')}</span>
                                <motion.span
                                    className="relative ml-2"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.span>
                            </Button>
                        </motion.div>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.print()}
                            className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        >
                            <Download className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> {t('report.exportPdf')}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
