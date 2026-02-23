'use client';

import { motion } from 'framer-motion';
import { Target, Headphones, Briefcase, Mic, MicOff, X, Clock, Settings, Sparkles, Monitor } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { clsx } from 'clsx';

interface LiveHeaderProps {
    status: 'connected' | 'connecting' | 'error' | 'idle';
    elapsedTime: string;
    micActive: boolean;
    isMuted: boolean;
    hasSystemAudio: boolean;
    tipsCount: number;
    onEndSession: () => void;
    onToggleMute: () => void;
    onOpenSettings?: () => void;
}

export function LiveHeader({
    status, elapsedTime, micActive, isMuted, hasSystemAudio, tipsCount,
    onEndSession, onToggleMute, onOpenSettings,
}: LiveHeaderProps) {
    const { t, aiMode, setAiMode } = useAppStore();

    const MODES = [
        { id: 'sales', icon: Target, label: 'Vendas' },
        { id: 'support', icon: Headphones, label: 'Suporte' },
        { id: 'interview', icon: Briefcase, label: 'Entrevista' },
    ];

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md relative z-50 shrink-0">
            {/* Left: Timer & Status */}
            <div className="flex items-center gap-3 lg:gap-5 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-[3px] h-3">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="w-1 bg-red-500 rounded-full" />
                        <motion.div animate={{ height: [4, 8, 4] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-red-500 rounded-full" />
                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-red-500 rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-widest hidden sm:block">LIVE</span>
                </div>

                <div className="h-6 w-px bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-1.5 text-neutral-300 text-sm font-bold tabular-nums">
                    <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>{elapsedTime}</span>
                </div>

                <div
                    className={clsx(
                        'text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider hidden md:block',
                        status === 'connected'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : status === 'connecting'
                                ? 'bg-amber-500/10 text-amber-400 animate-pulse border border-amber-500/20'
                                : 'bg-neutral-800 text-neutral-500'
                    )}
                >
                    {status}
                </div>

                {/* System Audio Badge */}
                <div
                    className={clsx(
                        'text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider hidden lg:flex items-center gap-1.5',
                        hasSystemAudio
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-neutral-800/50 text-neutral-600 border border-white/5'
                    )}
                >
                    <Monitor className="w-3 h-3" />
                    {hasSystemAudio ? 'Áudio Captado' : 'Sem Áudio'}
                </div>
            </div>

            {/* Center: Mode Toggle with layoutId */}
            <div className="flex items-center justify-center">
                <div className="flex items-center bg-black/50 border border-white/5 rounded-full p-1 shadow-inner relative">
                    {MODES.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setAiMode(mode.id as 'sales' | 'support' | 'interview')}
                            className={clsx(
                                'relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10',
                                aiMode === mode.id
                                    ? 'text-black'
                                    : 'text-neutral-400 hover:text-white'
                            )}
                        >
                            {aiMode === mode.id && (
                                <motion.div
                                    layoutId="activeMode"
                                    className="absolute inset-0 bg-white rounded-full shadow-md"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <mode.icon className={clsx('w-3.5 h-3.5 shrink-0 relative z-10', aiMode === mode.id && 'text-black')} />
                            <span className="hidden lg:inline relative z-10">{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 lg:gap-3">
                {/* Insights Counter */}
                {tipsCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{tipsCount}</span>
                        <span className="text-neutral-500 hidden lg:inline">insights</span>
                    </div>
                )}

                {/* Mute Button */}
                <button
                    onClick={onToggleMute}
                    className={clsx(
                        'p-2 rounded-lg transition-all border',
                        isMuted
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-white/5 text-emerald-400 border-white/10 hover:bg-white/10'
                    )}
                    title={isMuted ? 'Ativar Microfone' : 'Silenciar Microfone'}
                >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Settings */}
                {onOpenSettings && (
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
                        title="Conectar Integrações (API Keys)"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden lg:inline">Integrações</span>
                    </button>
                )}

                {/* End Session */}
                <button
                    onClick={onEndSession}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all text-xs font-bold uppercase tracking-wider shrink-0"
                >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Encerrar</span>
                </button>
            </div>
        </header>
    );
}
