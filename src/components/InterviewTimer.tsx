"use client";

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export function InterviewTimer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 font-mono text-sm">
            <Timer className="w-4 h-4" />
            <span>{formatTime(seconds)}</span>
        </div>
    );
}
