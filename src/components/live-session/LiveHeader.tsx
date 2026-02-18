'use client';

import { Target, Headphones, Briefcase, Mic, Wifi, X, Clock, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { clsx } from 'clsx';

interface LiveHeaderProps {
    status: 'connected' | 'connecting' | 'error' | 'idle';
    elapsedTime: string;
    micActive: boolean;
    onEndSession: () => void;
    onOpenSettings?: () => void;
}

export function LiveHeader({ status, elapsedTime, micActive, onEndSession, onOpenSettings }: LiveHeaderProps) {
    const { t, aiMode, setAiMode } = useAppStore();

    const MODES = [
        { id: 'sales', icon: Target, label: 'Sales' },
        { id: 'support', icon: Headphones, label: 'Support' },
        { id: 'interview', icon: Briefcase, label: 'Career' },
    ];

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md relative z-50 shrink-0">
            {/* Left: Timer & Status */}
            <div className="flex items-center gap-3 lg:gap-5 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wider hidden sm:block">LIVE</span>
                </div>

                <div className="h-6 w-px bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-1.5 text-neutral-400 text-sm font-medium tabular-nums">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{elapsedTime}</span>
                </div>

                <div
                    className={clsx(
                        'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden md:block',
                        status === 'connected'
                            ? 'bg-white/10 text-white border border-white/20'
                            : status === 'connecting'
                                ? 'bg-white/5 text-neutral-400 animate-pulse border border-white/10'
                                : 'bg-neutral-800 text-neutral-500'
                    )}
                >
                    {status}
                </div>
            </div>

            {/* Center: Mode Toggle */}
            <div className="flex items-center justify-center">
                <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-0.5">
                    {MODES.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setAiMode(mode.id as 'sales' | 'support' | 'interview')}
                            className={clsx(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                                aiMode === mode.id
                                    ? 'bg-white text-neutral-950 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                            )}
                        >
                            <mode.icon className={clsx('w-3.5 h-3.5 shrink-0', aiMode === mode.id && 'text-black')} />
                            <span className="hidden lg:inline">{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 lg:gap-4">
                {/* Mic Status */}
                <div className="hidden md:flex items-center gap-3 text-xs font-medium text-neutral-500">
                    <div className="flex items-center gap-1.5">
                        <Mic className={clsx('w-3.5 h-3.5', micActive ? 'text-white' : 'text-neutral-600')} />
                        <span className={micActive ? 'text-white' : 'text-neutral-600'}>
                            {micActive ? 'Active' : 'Muted'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>

                {/* API Keys / Settings Button */}
                {onOpenSettings && (
                    <button
                        onClick={onOpenSettings}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white transition-colors text-xs font-medium"
                        title="Configurar API Keys"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">API Keys</span>
                    </button>
                )}

                {/* End Session */}
                <button
                    onClick={onEndSession}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors text-xs font-bold uppercase tracking-wider shrink-0"
                >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">End</span>
                </button>
            </div>
        </header>
    );
}
