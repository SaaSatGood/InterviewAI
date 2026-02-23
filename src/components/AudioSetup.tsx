'use client';

// AudioSetup — Modal for configuring audio capture sources
// Simplified UX: No technical jargon, auto-selects best engine
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Radio, X, Target, Zap, AlertTriangle, Key, ShieldCheck } from 'lucide-react';
import { CaptureMode } from '@/hooks/useAudioCapture';
import { TranscriptionEngine, isWebSpeechSupported } from '@/hooks/useTranscription';
import { useAppStore } from '@/lib/store';

interface AudioSetupProps {
    onStart: (mode: CaptureMode, engine: TranscriptionEngine) => void;
    onClose: () => void;
    onOpenApiKeyModal?: () => void;
}

const CONTEXT_TEMPLATES = [
    { label: "🎯 Fechamento de Vendas B2B", text: "Vou fazer uma reunião com o [Cargo] da empresa [Empresa]. O produto custa [Valor]. Objetivo: Fechar o contrato. Risco principal: Objeção de preço e budget." },
    { label: "👔 Entrevista Técnica", text: "Serei entrevistado para a vaga de [Cargo] na [Empresa]. Minha maior insegurança é [Tópico, ex: System Design]. Faça perguntas técnicas e avalie minhas respostas." },
    { label: "📈 Pitch Executivo", text: "Apresentação de novo projeto para a Diretoria/Stakeholders. Eles têm pouco tempo. Foque em pedir o ROI, métricas de sucesso e viabilidade de implementação." },
    { label: "🥊 Negociação (Salário)", text: "Reunião com meu gestor direto para pedir uma promoção e aumento de salário (+20%). Quero argumentar com base nos meus resultados recentes. Faça o gestor resistente." }
];

export function AudioSetup({ onStart, onClose, onOpenApiKeyModal }: AudioSetupProps) {
    const [selectedMode, setSelectedMode] = useState<CaptureMode>('call');
    const { jobContext, apiKeys, language, setJobContext } = useAppStore();
    const [isStarting, setIsStarting] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [context, setContext] = useState(
        jobContext?.jobDescription ||
        [jobContext?.companyName, jobContext?.jobTitle].filter(Boolean).join(' - ')
    );

    useEffect(() => {
        // Auto-focus no campo de contexto assim que o modal abrir
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setJobContext({
                companyName: '',
                jobTitle: '',
                jobDescription: context,
                companyUrl: ''
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [context, setJobContext]);

    // Command + Enter to Enter Room
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleStart();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [context, selectedMode]); // Depends on dependencies that handleStart uses

    const openAiKey = useMemo(() => apiKeys.find(k => k.provider === 'openai'), [apiKeys]);
    const hasValidKey = !!openAiKey;
    const webSpeechSupported = isWebSpeechSupported();

    const [isChromium, setIsChromium] = useState(false);
    useEffect(() => {
        setIsChromium(
            typeof window !== 'undefined' &&
            /chrome|chromium|edg/i.test(navigator.userAgent) &&
            !/firefox|safari/i.test(navigator.userAgent)
        );
    }, []);

    // Determine the best engine automatically
    const canStartSetup = selectedMode === 'presential' ? (hasValidKey || webSpeechSupported) : hasValidKey;
    const hasEnoughContext = context.length >= 15;
    const isReadyToStart = canStartSetup && hasEnoughContext;

    const getBestEngine = (): TranscriptionEngine => {
        if (!hasValidKey) return 'browser'; // Fallback to free browser engine
        return 'whisper';
    };

    const handleStart = () => {
        if (!isReadyToStart || isStarting) return;
        setIsStarting(true);
        onStart(selectedMode, getBestEngine());
    };

    const apiKeyError = !hasValidKey && selectedMode === 'call' ? (
        language === 'pt'
            ? 'Para uma simulação imersiva online, vincule sua conta da OpenAI nas configurações da conta.'
            : 'For an immersive online simulation, please link your OpenAI account in the settings.'
    ) : null;


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="glass-panel rounded-3xl p-8 w-full max-w-xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] max-h-[90vh] overflow-y-auto relative border border-white/10 bg-[#0A0A0A]"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex items-start justify-between mb-8"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight mb-2">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            {language === 'pt' ? 'Preparar Cenário' : 'Set the Stage'}
                        </h2>
                        <p className="text-neutral-400 text-sm max-w-sm leading-relaxed">
                            {language === 'pt'
                                ? 'Configure o contexto para que a IA atue estritamente no personagem durante a simulação.'
                                : 'Set the stage so the Coach can act strictly in character during the simulation.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-neutral-400 hover:text-white border border-transparent hover:border-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Context Input section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mb-8"
                >
                    <label className="text-xs font-bold text-neutral-400 mb-1 uppercase tracking-widest block">
                        {language === 'pt' ? 'Qual é a sua meta nesta reunião?' : 'What is your goal for this meeting?'}
                    </label>
                    <p className="text-[13px] text-neutral-500 mb-3">
                        {language === 'pt' ? 'Seja específico. Informe com quem está falando, o que deseja alcançar e quais objeções espera enfrentar.' : 'Be specific. Tell the Coach who you are talking to, what you want to achieve, and what objections you expect.'}
                    </p>

                    <textarea
                        ref={textareaRef}
                        rows={5}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-white/30 focus:bg-[#151515] focus:ring-1 focus:ring-white/20 focus:outline-none transition-all resize-y min-h-[120px] placeholder:text-neutral-600 leading-relaxed mb-3"
                        placeholder={language === 'pt'
                            ? "Ex: Tenho uma call com o CFO de uma rede de hospitais para vender nosso software de $80k. Objetivo: fechar o contrato. Risco principal: ele provavelmente vai dizer que o budget desse ano já acabou."
                            : "Ex: I have a call with the CFO of a hospital network to sell our $80k software. Goal: close the deal. Main risk: he will probably say this year's budget is gone."}
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                    />

                    <div className="flex flex-wrap gap-2">
                        {CONTEXT_TEMPLATES.map((tpl, i) => (
                            <button
                                key={i}
                                onClick={() => setContext(tpl.text)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs text-neutral-300 font-medium transition-colors hover:text-white"
                            >
                                {tpl.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mb-8"
                >
                    <label className="text-xs font-bold text-neutral-400 mb-3 uppercase tracking-widest block">
                        {language === 'pt' ? 'Modo de Interação' : 'Interaction Mode'}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => isChromium && setSelectedMode('call')}
                            className={`p-5 rounded-2xl border text-left transition-all flex flex-col items-start gap-2 relative overflow-hidden group ${selectedMode === 'call'
                                ? 'border-[var(--color-primary,white)] bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]'
                                : isChromium
                                    ? 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                                    : 'border-white/5 bg-black/40 opacity-40 cursor-not-allowed'
                                }`}
                        >
                            <Monitor className={`w-6 h-6 ${selectedMode === 'call' ? 'text-white' : 'text-neutral-500'}`} />
                            <div>
                                <h3 className={`font-bold text-sm ${selectedMode === 'call' ? 'text-white' : 'text-neutral-300'}`}>
                                    {language === 'pt' ? 'Videoconferência' : 'Video Conference'}
                                </h3>
                                <p className="text-[11px] text-neutral-500 mt-1">{language === 'pt' ? 'Simulação face a face' : 'Face-to-face simulation'}</p>
                            </div>

                            {selectedMode === 'call' && (
                                <div className="absolute top-4 right-4 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-black rounded-full" />
                                </div>
                            )}

                            {!isChromium && (
                                <span className="text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-md flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 text-yellow-500/50" /> {language === 'pt' ? 'Requer Chrome ou Edge' : 'Needs Chrome/Edge'}</span>
                            )}
                        </button>

                        <button
                            onClick={() => setSelectedMode('presential')}
                            className={`p-5 rounded-2xl border text-left transition-all flex flex-col items-start gap-2 relative overflow-hidden group ${selectedMode === 'presential'
                                ? 'border-[var(--color-primary,white)] bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]'
                                : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                                }`}
                        >
                            <Radio className={`w-6 h-6 ${selectedMode === 'presential' ? 'text-white' : 'text-neutral-500'}`} />
                            <div>
                                <h3 className={`font-bold text-sm ${selectedMode === 'presential' ? 'text-white' : 'text-neutral-300'}`}>
                                    {language === 'pt' ? 'Apenas Áudio' : 'Audio Only'}
                                </h3>
                                <p className="text-[11px] text-neutral-500 mt-1">{language === 'pt' ? 'Foco total no diálogo' : 'Full focus on dialogue'}</p>
                            </div>

                            {selectedMode === 'presential' && (
                                <div className="absolute top-4 right-4 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-black rounded-full" />
                                </div>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Warnings / Errors */}
                {apiKeyError && (
                    <div className="p-4 rounded-xl bg-[#111] border border-red-500/20 text-white mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-medium text-red-100">{apiKeyError}</span>
                        </div>
                        {onOpenApiKeyModal && (
                            <button
                                onClick={onOpenApiKeyModal}
                                className="shrink-0 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                            >
                                Configurar API Key
                            </button>
                        )}
                    </div>
                )}

                {/* CTA Button and Privacy Note */}
                <div className="mt-8 border-t border-white/5 pt-6">
                    <button
                        onClick={handleStart}
                        disabled={!isReadyToStart || isStarting}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all flex flex-col items-center justify-center gap-1 border relative overflow-hidden group ${isReadyToStart
                            ? 'bg-white text-black hover:bg-neutral-200 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98]'
                            : 'bg-[#111] border-white/5 text-neutral-600 cursor-not-allowed'
                            }`}
                    >
                        {isStarting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span className="tracking-wide">{language === 'pt' ? 'Conectando ao Coach...' : 'Connecting to Coach...'}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Zap className={isReadyToStart ? 'w-4 h-4 fill-current' : 'w-4 h-4'} />
                                <span>{language === 'pt' ? 'Entrar na Sala' : 'Enter Room'}</span>
                                {isReadyToStart && (
                                    <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/10 text-black/60 border border-black/10">
                                        ⌘ ↵
                                    </span>
                                )}
                            </div>
                        )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{language === 'pt' ? '🔒 Suas simulações são privadas e este roteiro não é armazenado.' : '🔒 Your simulations are private and this script is not stored.'}</span>
                    </div>
                </div>

            </motion.div>
        </motion.div>
    );
}

