'use client';

// AudioSetup — Modal for configuring audio capture sources
// Includes transcription engine selection with free Browser option
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Monitor, Radio, X, AlertTriangle, Key, Zap, Clock, Globe, Target, Briefcase, FileText, DollarSign, CheckCircle2 } from 'lucide-react';
import { CaptureMode } from '@/hooks/useAudioCapture';
import { TranscriptionEngine, isWebSpeechSupported } from '@/hooks/useTranscription';
import { useAppStore } from '@/lib/store';

interface AudioSetupProps {
    onStart: (mode: CaptureMode, engine: TranscriptionEngine) => void;
    onClose: () => void;
    onOpenApiKeyModal?: () => void;
}

const CONTEXT_TEMPLATES = [
    { label: "Enterprise SaaS – CFO", text: "Estou em uma call com um CFO de uma fintech Série B.\nTicket médio: $18k/ano.\nObjetivo: avançar para proposta formal.\nPrincipais riscos: objeção de preço e timing." },
    { label: "Call de Diagnóstico", text: "Primeira reunião com Head de Marketing.\nObjetivo: Entender dores atuais com ferramentas de analytics.\nMetodologia: SPIN Selling.\nRiscos: Cliente satisfeito com concorrente atual." },
    { label: "Negociação Avançada", text: "Reunião final com comitê de compras.\nJá apresentamos proposta técnica.\nFoco: Termos de contrato e desconto por volume.\nPersonalidade: Comprador agressivo." },
    { label: "Objeção de Preço", text: "Cliente gostou do produto mas achou caro.\nObjetivo: Defender valor e ROI, não dar desconto imediato.\nContexto: Budget anual fecha em 1 mês." },
    { label: "Fechamento Final", text: "Call para assinatura.\nObjetivo: Remover últimos bloqueios legais e garantir assinatura hoje.\n urgency: Alta." }
];

export function AudioSetup({ onStart, onClose, onOpenApiKeyModal }: AudioSetupProps) {
    const [selectedMode, setSelectedMode] = useState<CaptureMode>('call');
    const [selectedEngine, setSelectedEngine] = useState<TranscriptionEngine>('browser');
    const [webSpeechSupported, setWebSpeechSupported] = useState(true);
    const { resumeData, jobContext, apiKeys, language, aiMode, setJobContext } = useAppStore();
    const [isStarting, setIsStarting] = useState(false);
    const [startMessage, setStartMessage] = useState('');

    // Local state for context input
    const [context, setContext] = useState(
        jobContext?.jobDescription ||
        [jobContext?.companyName, jobContext?.jobTitle].filter(Boolean).join(' - ')
    );

    // Update global context
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


    // Check Web Speech API support on mount
    useEffect(() => {
        setWebSpeechSupported(isWebSpeechSupported());
    }, []);

    // Auto-switch engine when mode changes
    // Web Speech API (browser) CANNOT process system audio — only Whisper/Realtime can
    useEffect(() => {
        if (selectedMode === 'call' && selectedEngine === 'browser') {
            setSelectedEngine('whisper');
        }
    }, [selectedMode, selectedEngine]);

    // Check for OpenAI API key
    const openAiKey = useMemo(() => {
        return apiKeys.find(k => k.provider === 'openai');
    }, [apiKeys]);

    const hasValidKey = !!openAiKey;
    const needsApiKey = selectedEngine !== 'browser';
    const canStart = selectedEngine === 'browser' || hasValidKey;

    const [isChromium, setIsChromium] = useState(false);

    useEffect(() => {
        setIsChromium(
            typeof window !== 'undefined' &&
            /chrome|chromium|edg/i.test(navigator.userAgent) &&
            !/firefox|safari/i.test(navigator.userAgent)
        );
    }, []);

    const handleStart = () => {
        if (!canStart) return;
        setIsStarting(true);

        // Sequence of loading messages
        const messages = [
            "Initializing strategic context...",
            "Loading objection frameworks...",
            "Activating real-time intelligence..."
        ];

        let i = 0;
        setStartMessage(messages[0]);

        const interval = setInterval(() => {
            i++;
            if (i < messages.length) {
                setStartMessage(messages[i]);
            } else {
                clearInterval(interval);
                onStart(selectedMode, selectedEngine);
            }
        }, 800);
    };

    const modes: { id: CaptureMode; icon: React.ReactNode; title: string; desc: string; available: boolean }[] = [
        {
            id: 'call',
            icon: <Monitor className="w-5 h-5" />,
            title: language === 'pt' ? 'Chamada de Vídeo' : 'Video Call',
            desc: language === 'pt' ? 'Zoom, Meet, Teams - Transcrição em tempo real' : 'Zoom, Meet, Teams - Real-time transcription',
            available: isChromium,
        },
        {
            id: 'presential',
            icon: <Radio className="w-5 h-5" />,
            title: language === 'pt' ? 'Presencial' : 'In-Person',
            desc: language === 'pt' ? 'Microfone ambiente - Detecção de tom' : 'Room mic - Tone detection',
            available: true,
        },
    ];

    const engines: { id: TranscriptionEngine; title: string; subtitle: string; desc: string; usage: string; badge: string; badgeColor: string; available: boolean }[] = [
        {
            id: 'browser',
            title: 'Navigator',
            subtitle: 'Context & Strategy',
            desc: language === 'pt' ? 'Análise de contexto e preparação.' : 'Context analysis and prep.',
            usage: language === 'pt' ? 'Modo presencial apenas' : 'In-person mode only',
            badge: 'FREE',
            badgeColor: 'bg-white/10 text-white border border-white/20',
            available: webSpeechSupported && selectedMode !== 'call',
        },
        {
            id: 'whisper',
            title: 'Whisper',
            subtitle: 'Live Tactical Support',
            desc: language === 'pt' ? 'IA escuta e sugere táticas.' : 'AI listens and suggests tactics.',
            usage: language === 'pt' ? 'Calls comerciais sérias' : 'Serious sales calls',
            badge: 'STANDARD',
            badgeColor: 'bg-white/10 text-white border border-white/20',
            available: true,
        },
        {
            id: 'realtime',
            title: 'Realtime',
            subtitle: 'Aggressive Close Mode',
            desc: language === 'pt' ? 'Respostas instantâneas e fechamento.' : 'Instant answers & closing.',
            usage: language === 'pt' ? 'Deals high-ticket' : 'High-ticket deals',
            badge: 'PRO',
            badgeColor: 'bg-white/10 text-white border border-white/20',
            available: true,
        },
    ];

    const apiKeyError = needsApiKey && !hasValidKey ? (
        language === 'pt'
            ? 'Adicione uma API Key da OpenAI'
            : language === 'es'
                ? 'Agregue una API Key de OpenAI'
                : 'Add an OpenAI API Key'
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
                className="glass-panel rounded-3xl p-8 w-full max-w-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] max-h-[90vh] overflow-y-auto relative border border-white/10 bg-neutral-900"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight mb-2">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            {language === 'pt' ? 'Configuração Estratégica da Sessão' : 'Strategic Session Setup'}
                        </h2>
                        <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                            {language === 'pt'
                                ? 'Defina o contexto da negociação para que a IA atue como seu estrategista de vendas.'
                                : 'Define the negotiation context so the AI acts as your sales strategist.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition text-neutral-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Block 1: Negotiation Context */}
                <div className="mb-8 p-1">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                {language === 'pt' ? 'Contexto da Venda' : 'Sales Context'}
                            </label>
                            <span className="text-[10px] text-neutral-500">
                                {language === 'pt' ? 'Quanto mais estratégico, mais precisa será a IA.' : 'More strategic context = sharper AI.'}
                            </span>
                        </div>

                        <textarea
                            rows={5}
                            className="w-full bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-white/30 focus:bg-neutral-900 focus:outline-none transition-all scrollbar-none resize-none placeholder:text-neutral-700 leading-relaxed"
                            placeholder={language === 'pt'
                                ? "Ex: Estou em uma call com um CFO de uma fintech Série B.\nTicket médio: $18k/ano.\nObjetivo: avançar para proposta formal.\nPrincipais riscos: objeção de preço e timing."
                                : "Ex: Call with fintech Series B CFO.\nACV: $18k.\nGoal: move to formal proposal.\nRisks: price objection and timing."}
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                        />

                        {/* Templates */}
                        <div className="flex flex-wrap gap-2">
                            {CONTEXT_TEMPLATES.map((tpl, i) => (
                                <button
                                    key={i}
                                    onClick={() => setContext(tpl.text)}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[10px] text-neutral-300 font-medium transition-all flex items-center gap-1.5"
                                >
                                    {i === 0 && <Briefcase className="w-3 h-3 text-neutral-400" />}
                                    {i === 3 && <DollarSign className="w-3 h-3 text-neutral-400" />}
                                    {i === 4 && <CheckCircle2 className="w-3 h-3 text-neutral-400" />}
                                    {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Block 2: Intelligence Level */}
                <div className="mb-8">
                    <p className="text-xs font-bold text-neutral-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                        {language === 'pt' ? 'Nível de Inteligência Ativa' : 'Active Intelligence Level'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {engines.map(engine => (
                            <button
                                key={engine.id}
                                onClick={() => engine.available && setSelectedEngine(engine.id)}
                                disabled={!engine.available}
                                className={`p-4 rounded-2xl border transition-all relative group text-left h-full flex flex-col ${selectedEngine === engine.id
                                    ? 'border-white bg-white/10 ring-1 ring-white/20'
                                    : engine.available
                                        ? 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                                        : 'border-white/5 bg-black/40 opacity-40 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-sm font-bold text-white">{engine.title}</p>
                                    <span className="text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-white/10 text-white border border-white/10 shadow-sm font-sans">
                                        {engine.badge}
                                    </span>
                                </div>
                                <p className="text-[11px] font-bold text-neutral-200 mb-1.5 uppercase tracking-wider">{engine.subtitle}</p>
                                <p className="text-xs text-neutral-300 leading-relaxed mb-4 flex-grow">{engine.desc}</p>
                                <div className="mt-auto pt-3 border-t border-white/10">
                                    <p className="text-[10px] text-neutral-400">
                                        <span className="font-extrabold text-neutral-200">Uso típico:</span> {engine.usage}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Block 3: Session Environment */}
                <div className="mb-8">
                    <p className="text-xs font-bold text-neutral-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                        {language === 'pt' ? 'Ambiente da Sessão' : 'Session Environment'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {modes.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => mode.available && setSelectedMode(mode.id)}
                                disabled={!mode.available}
                                className={`p-4 rounded-xl border text-left transition-all ${selectedMode === mode.id
                                    ? 'border-white bg-white/10 shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)]'
                                    : mode.available
                                        ? 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-white/5'
                                        : 'border-neutral-800 bg-neutral-900/50 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={selectedMode === mode.id ? 'text-white' : 'text-neutral-500'}>
                                        {mode.icon}
                                    </div>
                                    <span className="text-sm font-medium text-white">{mode.title}</span>
                                </div>
                                <p className="text-[10px] text-neutral-400 pl-8">{mode.desc}</p>
                                {!mode.available && mode.id === 'call' && (
                                    <div className="flex items-center gap-1 mt-2 text-[9px] text-neutral-500 pl-8">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Chrome/Edge Required</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* System Audio Guidance for Call Mode */}
                    {selectedMode === 'call' && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                            <Monitor className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-neutral-400 leading-relaxed">
                                {language === 'pt'
                                    ? 'Ao iniciar, uma janela de compartilhamento abrirá. Selecione a aba do Zoom/Meet e marque "Compartilhar áudio" para que a IA escute o áudio da reunião.'
                                    : 'After starting, a share dialog will open. Select the Zoom/Meet tab and check "Share audio" so the AI can hear the meeting audio.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Block 4: Compliance */}
                <div className="mb-6 flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="p-1 rounded bg-white/5 text-neutral-400">
                        <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                        {language === 'pt'
                            ? 'Utilize com responsabilidade. Algumas organizações exigem consentimento para assistência em tempo real.'
                            : 'Use responsibly. Some organizations require consent for real-time assistance.'}
                    </p>
                </div>

                {/* API Key Validation Error */}
                {apiKeyError && (
                    <div className="p-3 rounded-lg bg-white/5 text-white text-sm mb-4 border border-white/20 animate-pulse">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4 flex-shrink-0" />
                            <span>{apiKeyError}</span>
                        </div>
                        {onOpenApiKeyModal && (
                            <button
                                onClick={onOpenApiKeyModal}
                                className="mt-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all border border-white/10"
                            >
                                ➕ {language === 'pt' ? 'Adicionar API Key' : language === 'es' ? 'Agregar API Key' : 'Add API Key'}
                            </button>
                        )}
                    </div>
                )}

                {/* CTA - Power Moment */}
                <button
                    onClick={handleStart}
                    disabled={!canStart || isStarting}
                    className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex flex-col items-center justify-center gap-1 border relative overflow-hidden group ${canStart
                        ? 'bg-white text-black hover:bg-neutral-200 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.99]'
                        : 'bg-neutral-900 text-neutral-600 border-white/5 cursor-not-allowed'
                        }`}
                >
                    {isStarting ? (
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span className="text-sm font-mono tracking-wider animate-pulse">{startMessage}</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <Zap className={canStart ? 'fill-black w-5 h-5' : 'w-5 h-5 fill-neutral-600'} />
                                <span>{language === 'pt' ? 'ATIVAR IA ESTRATÉGICA' : 'ACTIVATE STRATEGIC AI'}</span>
                            </div>
                            {canStart && (
                                <span className="text-[10px] font-normal text-neutral-500 group-hover:text-neutral-600">
                                    {language === 'pt'
                                        ? 'Sua IA começará a monitorar, analisar e sugerir ações.'
                                        : 'Your AI will start monitoring, analyzing, and suggesting actions.'}
                                </span>
                            )}
                        </>
                    )}
                </button>
            </motion.div>
        </motion.div>
    );
}
