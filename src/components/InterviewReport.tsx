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
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all shadow-sm group"
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-100 text-sm sm:text-base truncate">{label}</p>
                    <p className="text-xs text-neutral-500 font-medium tracking-wide">{weight} WEIGHT</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-white tracking-tight">{score}</span>
                    <span className="text-xs text-neutral-600 block">/100</span>
                </div>
            </div>

            <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    className="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
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
            className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all shadow-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-white/5 border border-white/5 text-neutral-300 text-xs font-bold rounded-lg shrink-0">
                            Q{index + 1}
                        </span>
                        <h4 className="font-semibold text-neutral-100 text-base">{qa.topic}</h4>
                    </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 flex items-baseline gap-1 border border-white/5 self-start">
                    <span className="text-xl font-bold text-white">{qa.score}</span>
                    <span className="text-xs text-neutral-500">/100</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-neutral-800/30 p-5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-neutral-500 shrink-0" />
                        <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider">{t('report.yourAnswer')}</p>
                    </div>
                    <p className="text-neutral-300 text-sm leading-relaxed">{qa.candidateAnswer}</p>
                </div>
                <div className="bg-indigo-500/5 p-5 rounded-xl border border-indigo-500/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0" />
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{t('report.couldImprove')}</p>
                    </div>
                    <p className="text-neutral-300 text-sm leading-relaxed">{qa.whatWasMissing}</p>
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
        const badges: Record<string, { bg: string; label: string; icon: React.ElementType; glow: string }> = {
            'STRONG_HIRE': { bg: 'bg-emerald-500 text-white', label: t('hiring.strongHire'), icon: ThumbsUp, glow: 'shadow-emerald-500/30' },
            'HIRE': { bg: 'bg-emerald-600 text-white', label: t('hiring.hire'), icon: ThumbsUp, glow: 'shadow-emerald-600/30' },
            'LEAN_HIRE': { bg: 'bg-teal-600 text-white', label: t('hiring.leanHire'), icon: TrendingUp, glow: 'shadow-teal-600/30' },
            'LEAN_NO_HIRE': { bg: 'bg-amber-600 text-white', label: t('hiring.leanNoHire'), icon: TrendingUp, glow: 'shadow-amber-600/30' },
            'NO_HIRE': { bg: 'bg-red-600 text-white', label: t('hiring.noHire'), icon: ThumbsDown, glow: 'shadow-red-600/30' },
        };
        return badges[decision || ''] || { bg: 'bg-neutral-700 text-white', label: 'Evaluated', icon: BarChart3, glow: 'shadow-neutral-700/30' };
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
        <div className="min-h-screen bg-neutral-950 py-10 px-4 md:px-8 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-6xl mx-auto space-y-8 relative z-10"
            >
                {/* Header Card */}
                <motion.div variants={fadeInUp} className="bg-neutral-900/60 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 p-10 text-white relative overflow-hidden">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150"></div>
                        <div className="relative z-10 text-center">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                className="inline-block"
                            >
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]">
                                    <Award className="w-10 h-10 text-white" />
                                </div>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
                            >
                                {t('report.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-neutral-400 max-w-2xl mx-auto"
                            >
                                {t('report.subtitle')}
                            </motion.p>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 bg-black/20">
                        {/* Score Display */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-16">
                            {/* Circle Score */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="relative group"
                            >
                                {/* Glow behind circle */}
                                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>

                                <div className="w-56 h-56 relative z-10">
                                    <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 128 128">
                                        <circle
                                            className="text-neutral-800"
                                            strokeWidth="8"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="56"
                                            cx="64"
                                            cy="64"
                                        />
                                        <motion.circle
                                            initial={{ strokeDashoffset: 351 }}
                                            animate={{ strokeDashoffset: 351 - (351 * report.score) / 100 }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                            className="text-white"
                                            strokeWidth="8"
                                            strokeDasharray={351}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="56"
                                            cx="64"
                                            cy="64"
                                        />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, type: 'spring' }}
                                            className="text-6xl font-bold text-white block tracking-tighter"
                                        >
                                            {report.score}
                                        </motion.span>
                                        <span className="text-sm text-neutral-400 font-medium uppercase tracking-widest">{t('report.overall')}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Hiring Decision & Summary */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex-1 max-w-xl text-center lg:text-left"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="inline-block mb-6"
                                >
                                    <span className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-xl shadow-lg ${hiringBadge.bg} ${hiringBadge.glow} transition-shadow duration-300`}>
                                        <HiringIcon className="w-6 h-6" />
                                        {hiringBadge.label}
                                    </span>
                                </motion.div>

                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <h3 className="text-white font-semibold mb-2 flex items-center justify-center lg:justify-start gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-400" /> Executive Summary
                                    </h3>
                                    <p className="text-neutral-300 leading-relaxed text-sm lg:text-base">{report.feedback}</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>
                </motion.div>

                {/* Highlights & Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <motion.div variants={fadeInUp} className="bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Zap className="w-5 h-5 text-emerald-400" />
                            </div>
                            {t('report.bestMoments')}
                        </h3>
                        <ul className="space-y-3">
                            {report.interviewHighlights?.map((highlight: string, idx: number) => (
                                <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex gap-4 text-neutral-300 bg-white/[0.03] p-4 rounded-xl text-sm border border-white/5 hover:bg-white/[0.05] transition-colors hover:border-emerald-500/20 group"
                                >
                                    <span className="text-emerald-400 text-lg shrink-0 group-hover:scale-110 transition-transform">★</span>
                                    <span>{highlight}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Areas for Improvement */}
                    <motion.div variants={fadeInUp} className="bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-6">
                            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            </div>
                            {t('report.priorityImprovements')}
                        </h3>
                        <ul className="space-y-3">
                            {report.criticalGaps?.map((gap: string, idx: number) => (
                                <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex gap-4 text-neutral-300 bg-white/[0.03] p-4 rounded-xl text-sm border border-white/5 hover:bg-white/[0.05] transition-colors hover:border-amber-500/20 group"
                                >
                                    <span className="text-amber-400 text-lg shrink-0 group-hover:scale-110 transition-transform">!</span>
                                    <span>{gap}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Detailed Analysis */}
                {report.questionAnalysis && report.questionAnalysis.length > 0 && (
                    <motion.div variants={fadeInUp} className="bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-xl">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-white mb-8">
                            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <Target className="w-6 h-6 text-indigo-400" />
                            </div>
                            {t('report.questionAnalysis')}
                        </h3>
                        <div className="space-y-4">
                            {report.questionAnalysis.map((qa: any, idx: number) => (
                                <QuestionCard key={idx} qa={qa} index={idx} t={t} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Study Plan */}
                {report.studyPlan && report.studyPlan.length > 0 && (
                    <motion.div variants={fadeInUp} className="bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-xl">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-white mb-8">
                            <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
                                <GraduationCap className="w-6 h-6 text-pink-400" />
                            </div>
                            {t('report.studyPlan')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.studyPlan.map((item: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
                                    className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-pink-500/30 hover:bg-white/[0.07] transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 border border-pink-500/20">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-neutral-100 text-lg mb-2">{item.topic}</h4>
                                            <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{item.reason}</p>
                                            <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                <BookOpen className="w-4 h-4 text-pink-400 shrink-0" />
                                                <p className="text-neutral-300 text-xs font-medium truncate">{item.resources}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div variants={fadeInUp} className="bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 text-center">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {/* Animated New Interview Button */}
                        <motion.div
                            className="relative group w-full sm:w-auto"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-white to-neutral-300 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                            <Button
                                onClick={resetSession}
                                size="lg"
                                className="relative w-full sm:w-auto px-8 py-6 text-lg bg-white text-neutral-900 hover:bg-neutral-100 border-0 shadow-xl"
                            >
                                <RefreshCw className="mr-3 w-5 h-5" />
                                <span className="font-semibold">{t('report.newInterview')}</span>
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.print()}
                            className="w-full sm:w-auto px-8 py-6 text-lg border-white/10 text-neutral-300 hover:bg-white/5 hover:text-white"
                        >
                            <Download className="mr-3 w-5 h-5" /> {t('report.exportPdf')}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
