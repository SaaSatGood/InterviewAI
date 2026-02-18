'use client';

import { motion } from 'framer-motion';
import { Brain, Activity, Zap, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { CoachTip } from '@/lib/prompts-coach';

interface IntelligenceSidebarProps {
    tips: CoachTip[];
    isAnalyzing: boolean;
    elapsedSeconds: number;
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-neutral-400">{label}</span>
                <span className={color}>{value}%</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                />
            </div>
        </div>
    );
}

export function IntelligenceSidebar({ tips, isAnalyzing, elapsedSeconds }: IntelligenceSidebarProps) {
    const { t } = useAppStore();

    // Compute real metrics from tips
    const totalTips = tips.length;
    const tipsPerMinute = elapsedSeconds > 60 ? Math.round((totalTips / elapsedSeconds) * 60) : totalTips;

    // Derive engagement score from tip frequency (heuristic)
    const engagementScore = Math.min(100, Math.round(tipsPerMinute * 20 + 30));

    // Count tip types for confidence heuristic
    const closingTips = tips.filter(t => t.type === 'closing' || t.type === 'value_prop').length;
    const objectionTips = tips.filter(t => t.type === 'objection' || t.type === 'escalation').length;
    const confidenceScore = totalTips > 0
        ? Math.min(100, Math.round(50 + (closingTips * 10) - (objectionTips * 5) + tipsPerMinute * 5))
        : 0;

    // Build real-time logs from actual tips
    const recentLogs = tips.slice(-6).map((tip, i) => {
        const timeOffset = Math.max(0, Math.floor((Date.now() - tip.timestamp) / 1000));
        const mins = Math.floor(timeOffset / 60);
        const secs = timeOffset % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const typeMap: Record<string, { msg: string; type: string }> = {
            discovery: { msg: 'Discovery insight generated', type: 'info' },
            objection: { msg: 'Objection handling ready', type: 'warning' },
            closing: { msg: 'Closing opportunity detected', type: 'success' },
            value_prop: { msg: 'Value prop suggested', type: 'success' },
            resolution: { msg: 'Resolution path found', type: 'success' },
            empathy: { msg: 'Empathy cue detected', type: 'info' },
            escalation: { msg: 'Escalation risk flagged', type: 'warning' },
            knowledge: { msg: 'Knowledge reference ready', type: 'info' },
            technical: { msg: 'Technical insight added', type: 'info' },
            behavioral: { msg: 'Behavioral pattern noted', type: 'info' },
            experience: { msg: 'Experience match found', type: 'success' },
            silence_tip: { msg: 'Silence strategy tip', type: 'warning' },
        };

        const mapped = typeMap[tip.type] || { msg: `Tip: ${tip.type}`, type: 'info' };
        return { time: timeStr, msg: mapped.msg, type: mapped.type };
    }).reverse();

    return (
        <div className="w-80 border-l border-white/5 bg-black/20 backdrop-blur-sm flex flex-col h-full">
            {/* Header: AI Status */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                        {t('coach.aiStatus')}
                    </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAnalyzing ? 'bg-white' : totalTips > 0 ? 'bg-white' : 'bg-neutral-500'}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isAnalyzing ? 'bg-white' : totalTips > 0 ? 'bg-white' : 'bg-neutral-600'}`} />
                    </span>
                    <span className="text-sm font-bold text-white">
                        {isAnalyzing ? (t('coach.analyzing') || 'Analyzing...') : totalTips > 0 ? 'Active' : 'Monitoring'}
                    </span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                    {totalTips > 0
                        ? `${totalTips} insights generated • ${tipsPerMinute}/min`
                        : t('coach.monitoring') || 'Waiting for conversation data...'}
                </p>
            </div>

            {/* Metrics — Real Data */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                        {t('coach.metrics') || 'Metrics'}
                    </span>
                </div>
                <MetricBar label="Confidence" value={confidenceScore} color="text-white" />
                <MetricBar label="Engagement" value={engagementScore} color="text-neutral-300" />
                <MetricBar label="Tips Generated" value={Math.min(100, totalTips * 10)} color="text-neutral-400" />
            </div>

            {/* Live Logs — Real Data */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">
                        {t('coach.logs') || 'Activity Log'}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 text-xs">
                    {recentLogs.length === 0 && (
                        <p className="text-neutral-600 text-[11px]">Awaiting first analysis...</p>
                    )}
                    {recentLogs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-2"
                        >
                            <span className="text-neutral-600 tabular-nums">[{log.time}]</span>
                            <span
                                className={
                                    log.type === 'success'
                                        ? 'text-white'
                                        : log.type === 'warning'
                                            ? 'text-neutral-300'
                                            : 'text-neutral-400'
                                }
                            >
                                {log.msg}
                            </span>
                        </motion.div>
                    ))}
                    {isAnalyzing && <div className="animate-pulse text-neutral-500">Processing...</div>}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <button className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/10">
                    <Sparkles className="w-3 h-3" />
                    {t('coach.save') || 'Save Session'}
                </button>
            </div>
        </div>
    );
}
