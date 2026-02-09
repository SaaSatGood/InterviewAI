"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { VoiceState } from '@/lib/voice';
import { Mic, MicOff, Volume2, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceOrbProps {
    state: VoiceState;
    audioLevel?: number;
    onClick?: () => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    transcript?: string;
}

export function VoiceOrb({
    state,
    audioLevel = 0,
    onClick,
    disabled = false,
    size = 'lg',
    transcript,
}: VoiceOrbProps) {
    const sizeMap = {
        sm: { orb: 80, icon: 24, ring: 100 },
        md: { orb: 120, icon: 32, ring: 150 },
        lg: { orb: 180, icon: 48, ring: 220 },
    };

    const dimensions = sizeMap[size];

    // Color schemes for different states
    const stateColors = {
        idle: {
            primary: 'from-neutral-700 to-neutral-800',
            glow: 'rgba(255, 255, 255, 0.1)',
            ring: 'border-neutral-600',
        },
        listening: {
            primary: 'from-blue-500 to-blue-600',
            glow: 'rgba(59, 130, 246, 0.4)',
            ring: 'border-blue-400',
        },
        speaking: {
            primary: 'from-emerald-500 to-emerald-600',
            glow: 'rgba(16, 185, 129, 0.4)',
            ring: 'border-emerald-400',
        },
        processing: {
            primary: 'from-amber-500 to-amber-600',
            glow: 'rgba(245, 158, 11, 0.3)',
            ring: 'border-amber-400',
        },
        error: {
            primary: 'from-red-500 to-red-600',
            glow: 'rgba(239, 68, 68, 0.3)',
            ring: 'border-red-400',
        },
    };

    const colors = stateColors[state];

    // Ring animation variants based on audio level
    const ringScale = 1 + (audioLevel * 0.3);

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Main Orb Container */}
            <div
                className="relative flex items-center justify-center cursor-pointer select-none"
                style={{ width: dimensions.ring, height: dimensions.ring }}
            >
                {/* Outer animated ring */}
                <AnimatePresence>
                    {(state === 'listening' || state === 'speaking') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, ringScale, 1],
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className={`absolute inset-0 rounded-full border-2 ${colors.ring}`}
                            style={{
                                boxShadow: `0 0 40px ${colors.glow}`,
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Secondary ring */}
                <AnimatePresence>
                    {state === 'listening' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                                scale: [0.95, 1.1, 0.95],
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.3,
                            }}
                            className={`absolute rounded-full border ${colors.ring}`}
                            style={{
                                width: dimensions.ring - 20,
                                height: dimensions.ring - 20,
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Main Orb */}
                <motion.button
                    onClick={onClick}
                    disabled={disabled}
                    whileHover={{ scale: disabled ? 1 : 1.05 }}
                    whileTap={{ scale: disabled ? 1 : 0.95 }}
                    animate={{
                        scale: state === 'speaking' ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                        scale: {
                            duration: 0.5,
                            repeat: state === 'speaking' ? Infinity : 0,
                            ease: 'easeInOut',
                        }
                    }}
                    className={`
                        relative z-10 rounded-full flex items-center justify-center
                        bg-gradient-to-br ${colors.primary}
                        shadow-2xl transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-4 focus:ring-white/20
                    `}
                    style={{
                        width: dimensions.orb,
                        height: dimensions.orb,
                        boxShadow: `0 0 60px ${colors.glow}, inset 0 -4px 20px rgba(0,0,0,0.3)`,
                    }}
                >
                    {/* Inner glow overlay */}
                    <div
                        className="absolute inset-2 rounded-full opacity-30"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
                        }}
                    />

                    {/* Icon */}
                    <motion.div
                        animate={{
                            rotate: state === 'processing' ? 360 : 0,
                        }}
                        transition={{
                            rotate: {
                                duration: 2,
                                repeat: state === 'processing' ? Infinity : 0,
                                ease: 'linear',
                            }
                        }}
                    >
                        {state === 'idle' && (
                            <Mic className="text-white drop-shadow-lg" style={{ width: dimensions.icon, height: dimensions.icon }} />
                        )}
                        {state === 'listening' && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                <Mic className="text-white drop-shadow-lg" style={{ width: dimensions.icon, height: dimensions.icon }} />
                            </motion.div>
                        )}
                        {state === 'speaking' && (
                            <Volume2 className="text-white drop-shadow-lg" style={{ width: dimensions.icon, height: dimensions.icon }} />
                        )}
                        {state === 'processing' && (
                            <Loader2 className="text-white drop-shadow-lg animate-spin" style={{ width: dimensions.icon, height: dimensions.icon }} />
                        )}
                        {state === 'error' && (
                            <AlertCircle className="text-white drop-shadow-lg" style={{ width: dimensions.icon, height: dimensions.icon }} />
                        )}
                    </motion.div>
                </motion.button>

                {/* Audio level visualization (bars around the orb) */}
                {state === 'listening' && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(12)].map((_, i) => {
                            const angle = (i / 12) * 360;
                            const delay = i * 0.05;
                            return (
                                <motion.div
                                    key={i}
                                    className="absolute bg-blue-400 rounded-full"
                                    style={{
                                        width: 4,
                                        height: 12 + audioLevel * 20,
                                        left: '50%',
                                        top: '50%',
                                        transformOrigin: 'center center',
                                        transform: `rotate(${angle}deg) translateY(-${dimensions.orb / 2 + 15}px) translateX(-50%)`,
                                    }}
                                    animate={{
                                        height: [12, 12 + audioLevel * 30, 12],
                                        opacity: [0.4, 0.8, 0.4],
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        repeat: Infinity,
                                        delay,
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* State Text */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={state}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm font-medium text-neutral-400"
                >
                    {state === 'idle' && 'Tap to speak'}
                    {state === 'listening' && 'Listening...'}
                    {state === 'speaking' && 'Speaking...'}
                    {state === 'processing' && 'Processing...'}
                    {state === 'error' && 'Error occurred'}
                </motion.p>
            </AnimatePresence>

            {/* Transcript */}
            <AnimatePresence>
                {transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-md text-center px-4"
                    >
                        <p className="text-neutral-300 text-sm italic">
                            "{transcript}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
