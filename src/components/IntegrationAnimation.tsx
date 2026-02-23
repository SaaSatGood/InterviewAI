'use client';

import { motion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export function IntegrationAnimation() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Increased radius and scale for a more majestic, spacious enterprise feel
    const size = 800;
    const center = size / 2;

    // Map exact authentic SVG paths mapped to a 24x24 viewBox
    // Apps connect from outer orbit (much further out for spaciousness)
    const R_APP = 300;
    const appNodes = [
        {
            name: 'Zoom',
            color: '#2D8CFF',
            angle: -Math.PI * 0.75,
            path: 'M17 8H7C5.89543 8 5 8.89543 5 10V14C5 15.1046 5.89543 16 7 16H17C18.1046 16 19 15.1046 19 14V10C19 8.89543 18.1046 8 17 8ZM19 10.5L22.5 8C23.3284 7.44772 24 7.78331 24 8.79051V15.2095C24 16.2167 23.3284 16.5523 22.5 16L19 13.5V10.5Z',
            isAI: false
        },
        {
            name: 'Google Meet',
            color: '#00A97F',
            angle: -Math.PI * 0.25,
            path: 'M2 15V9C2 7.895 2.895 7 4 7H16C17.105 7 18 7.895 18 9V15C18 16.105 17.105 17 16 17H4C2.895 17 2 16.105 2 15ZM18 10.5V13.5L22 16.5V7.5L18 10.5Z',
            isAI: false
        },
        {
            name: 'WhatsApp',
            color: '#25D366',
            angle: Math.PI * 0.25,
            path: 'M17.498 14.28c-.282-.14-1.666-.822-1.925-.916-.258-.094-.447-.14-.635.14-.188.281-.728.916-.893 1.104-.165.188-.33.21-.612.071-.282-.14-1.188-.438-2.261-1.396-.835-.745-1.398-1.666-1.563-1.948-.165-.282-.018-.434.123-.574.127-.127.282-.328.423-.493.14-.164.188-.281.282-.47.094-.187.047-.352-.024-.493-.07-.14-.635-1.528-.87-2.09-.23-.55-.465-.476-.635-.484-.165-.008-.353-.008-.541-.008-.188 0-.494.07-.753.352-.258.281-.987.962-.987 2.348 0 1.385 1.011 2.723 1.152 2.911.141.188 1.986 3.033 4.811 4.253.672.29 1.196.463 1.605.592.675.215 1.29.184 1.775.111.545-.082 1.666-.68 1.901-1.338.235-.658.235-1.22.164-1.338-.07-.118-.258-.188-.54-.329zM12.002 21.05h-.006c-1.47 0-2.913-.395-4.174-1.143l-.3-.178-3.104.814.829-3.028-.195-.311c-.822-1.309-1.256-2.825-1.256-4.382 0-4.549 3.702-8.251 8.251-8.251 2.204 0 4.276.858 5.834 2.417s2.417 3.63 2.417 5.834c0 4.549-3.702 8.251-8.248 8.251z M12.002 2C6.478 2 2 6.477 2 12c0 1.765.463 3.486 1.343 5l-1.933 7.058 7.215-1.892c1.458.8 3.103 1.222 4.778 1.222h.005c5.522 0 10-4.477 10-10 0-2.676-1.042-5.192-2.936-7.086C18.513 3.042 15.344 2 12.002 2z',
            isAI: false
        },
        {
            name: 'Teams',
            color: '#464EB8',
            angle: Math.PI * 0.75,
            path: 'M13 14V17C13 18.1046 12.1046 19 11 19H4C2.89543 19 2 18.1046 2 17V14C2 12.8954 2.89543 12 4 12H11C12.1046 12 13 12.8954 13 14Z M18 13.5V16.5C18 17.3284 17.3284 18 16.5 18H14V12.5C14 11.6716 13.3284 11 12.5 11H9.5V8.5C9.5 7.67157 10.1716 7 11 7H16.5C17.3284 7 18 7.67157 18 8.5V13.5Z M7.5 9C8.88071 9 10 7.88071 10 6.5C10 5.11929 8.88071 4 7.5 4C6.11929 4 5 5.11929 5 6.5C5 7.88071 6.11929 9 7.5 9Z M14.5 6C15.3284 6 16 5.32843 16 4.5C16 3.67157 15.3284 3 14.5 3C13.6716 3 13 3.67157 13 4.5C13 5.32843 13.6716 6 14.5 6Z',
            isAI: false
        }
    ];

    const nodes = appNodes.map(node => ({
        ...node,
        x: center + R_APP * Math.cos(node.angle),
        y: center + R_APP * Math.sin(node.angle)
    }));

    // Random starfield background particles for a premium high-tech feel
    const backgroundParticles = mounted ? Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * size,
        y: Math.random() * size,
        r: Math.random() * 2 + 0.5,
        duration: Math.random() * 30 + 30, // even slower and smoother
    })) : [];

    if (!mounted) return <div className="w-full h-full min-h-[500px]" />;

    return (
        <div className="relative w-full aspect-square max-w-[800px] mx-auto flex items-center justify-center select-none overflow-visible">

            {/* Glowing background orb for depth (larger blur) */}
            <div className="absolute inset-0 bg-white/5 rounded-full blur-[160px] pointer-events-none" />

            {/* Core SVG Canvas */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox={`0 0 ${size} ${size}`}
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                    <linearGradient id="solid-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                    </linearGradient>
                </defs>

                {/* Floating ambient particles */}
                {backgroundParticles.map((particle) => (
                    <motion.circle
                        key={`bg-${particle.id}`}
                        cx={particle.x} cy={particle.y} r={particle.r}
                        fill="rgba(255,255,255,0.4)"
                        animate={{
                            x: [0, Math.random() * 40 - 20],
                            y: [0, Math.random() * 40 - 20],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}

                {/* Advanced Orbital Rings */}
                {/* Outer Ring for Apps */}
                <motion.circle
                    cx={center} cy={center} r={R_APP + 60}
                    fill="none"
                    stroke="url(#ring-gradient)"
                    strokeWidth="1.5"
                    strokeDasharray="10 20 5 25"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "center" }}
                />

                {/* Main Orbit Path for Apps */}
                <motion.circle
                    cx={center} cy={center} r={R_APP}
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "center" }}
                />

                {/* Inner Data Loop removed */}

                {nodes.map((node, i) => {
                    return (
                        <g key={`line-group-${i}`}>
                            {/* Base connection line */}
                            <line
                                x1={center} y1={center} x2={node.x} y2={node.y}
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1.5"
                                strokeDasharray="3 4"
                            />

                            {/* Data beam sending instructions to App (Comet effect) */}
                            <motion.path
                                d={`M${center},${center} L${node.x},${node.y}`}
                                stroke={node.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray="0 400"
                                style={{ filter: `drop-shadow(0 0 6px ${node.color})` }}
                                animate={{
                                    strokeDasharray: ["0 400", "80 400", "0 400"],
                                    strokeDashoffset: [0, -200, -250],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 2.5 + Math.random(),
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Audio data going from App to AI */}
                            <motion.circle
                                r="3"
                                fill="#ffffff"
                                initial={{ cx: node.x, cy: node.y, opacity: 0 }}
                                animate={{
                                    cx: [node.x, center],
                                    cy: [node.y, center],
                                    opacity: [0, 1, 1, 0],
                                }}
                                transition={{
                                    duration: 1.5 + Math.random(),
                                    repeat: Infinity,
                                    delay: i * 0.6 + 0.5,
                                    ease: "linear"
                                }}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Application Orbiting Nodes */}
            {nodes.map((node, i) => (
                <motion.div
                    key={node.name}
                    className="absolute z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${(node.x / size) * 100}%`, top: `${(node.y / size) * 100}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 1.5, delay: i * 0.15 + 0.3 }}
                >
                    <motion.div
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] bg-neutral-900/90 border-2 border-white/5 flex items-center justify-center shadow-2xl backdrop-blur-2xl relative group cursor-default transition-all duration-500"
                        whileHover={{ scale: 1.15, y: -5, zIndex: 30, borderColor: node.color, backgroundColor: 'rgba(23,23,23,1)' }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Immersive glow */}
                        <div
                            className="absolute inset-0 rounded-[28px] opacity-10 transition-all duration-500 group-hover:opacity-40 filter blur-xl"
                            style={{ backgroundColor: node.color }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[28px] pointer-events-none" />

                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white z-10 transition-colors duration-500 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" style={{ color: node.color }}>
                            <path d={node.path} fill="currentColor" stroke="none" />
                        </svg>

                        {/* Audio capturing active dot */}
                        <motion.div
                            className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] border border-red-900/50"
                            animate={{ opacity: [1, 0.2, 1], scale: [1, 0.9, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>

                    <div className="flex flex-col items-center mt-4 gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="text-[11px] sm:text-xs font-semibold text-neutral-300 uppercase tracking-[0.2em] bg-neutral-950/80 px-4 py-1.5 rounded-full backdrop-blur-2xl border border-white/5 shadow-xl">
                            {node.name}
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Intelligent Core (InterviewAI) */}
            <motion.div
                className="absolute z-20 flex flex-col items-center justify-center group"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, duration: 1.8 }}
                whileHover={{ scale: 1.05 }}
            >
                <div className="relative">
                    {/* Processing sound waves */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                            key={`wave-${i}`}
                            className="absolute inset-0 rounded-[32px] border border-white/10"
                            animate={{ scale: [1, 2.5 + i * 0.5], opacity: [0.6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: i * 0.8 }}
                        />
                    ))}

                    {/* Central Glow */}
                    <motion.div
                        className="absolute inset-0 bg-white rounded-full blur-[40px] opacity-30 mix-blend-screen"
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* The Brain / Core Node */}
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[36px] bg-[#0A0A0A] border-2 border-white/10 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.15)] relative z-10 overflow-hidden backdrop-blur-3xl transition-all duration-700 group-hover:border-white/30 group-hover:shadow-[0_0_100px_rgba(255,255,255,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/80 pointer-events-none" />

                        {/* Dynamic Activity Graph */}
                        <div className="absolute bottom-6 flex items-end gap-1.5 opacity-60 px-4 transition-opacity duration-300 group-hover:opacity-100">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                    key={`bar-${i}`}
                                    className="w-1.5 bg-white rounded-full"
                                    animate={{ height: [4, Math.random() * 16 + 8, 4] }}
                                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                />
                            ))}
                        </div>

                        <Sparkles className="w-14 h-14 text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)] mb-4 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
