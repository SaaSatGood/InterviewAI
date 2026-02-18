'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, Mic, ChevronDown, ArrowRight, Shield, Zap, Play,
    Eye, Headphones, Monitor, Users, Briefcase, Presentation,
    TrendingUp, Target, Award, BarChart3, MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface LandingPageProps {
    onStartInterview: () => void;
    onOpenLiveCoach: () => void;
    onOpenApiKey: () => void;
}

export function LandingPage({ onStartInterview, onOpenLiveCoach, onOpenApiKey }: LandingPageProps) {
    const { t } = useAppStore();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

    const FAQs = [
        {
            question: "Como funciona na prática?",
            answer: "A IA escuta o áudio da sua reunião em tempo real (via microfone ou captura do sistema), transcreve a conversa e gera dicas estratégicas, réplicas a objeções e sugestões de perguntas — tudo aparecendo discretamente na sua tela."
        },
        {
            question: "Funciona com Zoom, Meet e Teams?",
            answer: "Sim! Funciona com qualquer plataforma de videochamada: Zoom, Google Meet, Microsoft Teams, Hangouts e outras. Não requer plugins nem extensões — roda direto no navegador."
        },
        {
            question: "Aparece no compartilhamento de tela?",
            answer: "Não. A ferramenta opera em segundo plano e é completamente invisível no compartilhamento de tela. Ninguém na reunião saberá que você está usando."
        },
        {
            question: "Preciso pagar para usar?",
            answer: "Você pode testar gratuitamente usando o motor de transcrição do navegador. Para recursos avançados como Whisper e análise em tempo real com GPT-4, basta configurar sua própria API key."
        },
        {
            question: "Meus dados são seguros?",
            answer: "Sim. Tudo roda localmente no seu navegador. Suas chaves de API, transcrições e dados de contexto nunca saem do seu dispositivo."
        }
    ];

    const HOW_IT_WORKS = [
        {
            icon: Headphones,
            title: "Guia em Tempo Real",
            desc: "Enquanto você fala, a IA ouve e sugere fatos, argumentos e respostas para perguntas difíceis."
        },
        {
            icon: Shield,
            title: "Gestão de Objeções",
            desc: "Obtenha réplicas persuasivas e contextualizadas para manter o controle da conversa e fechar com autoridade."
        },
        {
            icon: Monitor,
            title: "Integração Instantânea",
            desc: "Funciona direto no Zoom, Google Meet, Microsoft Teams e outras plataformas. Sem instalações complicadas."
        },
        {
            icon: Eye,
            title: "Operação Discreta",
            desc: "Completamente invisível no compartilhamento de tela. Analisa áudio sem que seu público perceba."
        }
    ];

    const PERSONAS = [
        {
            icon: TrendingUp,
            title: "Profissionais de Vendas",
            desc: "Feche mais negócios ao responder objeções com dados e confiança."
        },
        {
            icon: Briefcase,
            title: "Empreendedores",
            desc: "Apresente sua visão de forma convincente e conquiste investidores e clientes."
        },
        {
            icon: Users,
            title: "Executivos & Diretores",
            desc: "Conduza reuniões estratégicas com dados instantâneos ao seu alcance."
        },
        {
            icon: MessageSquare,
            title: "Entrevistadores",
            desc: "Formule perguntas de impacto e reaja a respostas imprevistas com sugestões em tempo real."
        },
        {
            icon: Presentation,
            title: "Qualquer Apresentador",
            desc: "De entrevistas a conferências, eleve sua performance e nunca fique sem resposta."
        }
    ];

    const BENEFITS = [
        {
            icon: Award,
            title: "Confiança Imbatível",
            desc: "Nunca fique sem resposta. Fale com segurança total em qualquer reunião."
        },
        {
            icon: Zap,
            title: "Produtividade Máxima",
            desc: "Economize horas automatizando análises, follow-ups e respostas estratégicas."
        },
        {
            icon: Target,
            title: "Vantagem Competitiva",
            desc: "Supere concorrentes com apresentações impecáveis e baseadas em IA."
        },
        {
            icon: BarChart3,
            title: "Aperfeiçoamento Contínuo",
            desc: "Analise seu desempenho e melhore a cada apresentação com feedback da IA."
        }
    ];

    const TESTIMONIALS = [
        {
            role: "Enterprise AE",
            company: "SaaS Unicorn",
            metric: "+40% Win Rate",
            quote: "O Coach ao vivo me salvou em uma negociação de $200k. A IA sugeriu exatamente o que eu precisava falar para contornar a objeção de preço."
        },
        {
            role: "Product Manager",
            company: "Big Tech",
            metric: "Oferta Recebida",
            quote: "Usei durante minhas entrevistas na FAANG. Ajudou a estruturar minhas respostas no modelo STAR em tempo real. Fui aprovado."
        },
        {
            role: "Head de Vendas",
            company: "Fintech B2B",
            metric: "Ciclo de Venda -20%",
            quote: "Minha equipe reduziu o tempo de ramp-up pela metade. A ferramenta treina eles enquanto eles vendem. É uma vantagem injusta."
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white selection:bg-white/30 overflow-x-hidden pb-20">

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-neutral-900/50 rounded-full blur-[150px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shadow-lg shadow-white/5">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">InterviewAI</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenApiKey}
                        className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block"
                    >
                        Configurar API
                    </button>
                    <button
                        onClick={onOpenLiveCoach}
                        className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-sm font-medium transition-all backdrop-blur-sm"
                    >
                        Live Coach
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-24 px-6 text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold mb-8 backdrop-blur-md uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Vantagem Competitiva Injusta
                    </div>

                    <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-10 leading-[0.9] text-white select-none">
                        Domine a <br />
                        Conversa.
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium tracking-tight">
                        O co-piloto invisível que sopra as respostas exatas no seu ouvido.
                        <span className="text-white block mt-2">Você fecha o negócio. Nós damos a munição.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onOpenLiveCoach}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            Ativar Live Coach
                        </button>
                        <button
                            onClick={onStartInterview}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-black border border-white/20 text-white font-semibold text-lg hover:bg-neutral-900 hover:border-white/40 transition-all flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Simular Entrevista
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* AI Demo Quote */}
            <section className="relative z-10 pb-24 px-6 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wide">Análise ao Vivo</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white text-[10px] text-black font-bold tracking-wider uppercase">
                                DICA DA IA
                            </div>
                        </div>
                        <p className="text-neutral-300 text-sm md:text-base leading-relaxed italic">
                            "O InterviewAI lhe oferece orientação em tempo real e manuseio eficiente de objeções durante apresentações, para que você possa focar em entregar mensagens impactantes e fechar mais negócios. <span className="text-white font-medium">Pode me falar um pouco mais sobre as principais dificuldades que enfrenta com apresentações atualmente?</span>"
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* How It Works */}
            <section className="relative z-10 py-24 px-6 bg-neutral-900/30 border-y border-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-4">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.3em]">Como Funciona</span>
                    </div>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Domine qualquer situação com <br className="hidden md:block" />apoio em tempo real
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {HOW_IT_WORKS.map((item, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-3xl bg-neutral-950 border border-white/5 hover:border-white/20 hover:bg-neutral-900 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] group-hover:bg-white/10 transition-all" />

                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-neutral-400 group-hover:scale-110 group-hover:text-white transition-all group-hover:bg-white/10 group-hover:border-white/20">
                                    <item.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-lg font-bold mb-3 text-white group-hover:text-neutral-200 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-neutral-400 leading-relaxed text-sm group-hover:text-neutral-300">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Whom / Personas */}
            <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-4">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.3em]">Aplicações</span>
                </div>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Para quem lidera, vende, entrevista ou apresenta
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {PERSONAS.map((persona, i) => (
                        <div
                            key={i}
                            className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                                <persona.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold mb-2 text-white">{persona.title}</h3>
                            <p className="text-xs text-neutral-500 leading-relaxed group-hover:text-neutral-400">{persona.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits / Features */}
            {/* Benefits / Features - MASTER CARD LAYOUT */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row gap-12 lg:gap-24 shadow-2xl">

                        {/* Left Column: Heading */}
                        <div className="flex-1 lg:max-w-md flex flex-col justify-start">
                            <div className="mb-8">
                                <span className="px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                                    Funcionalidades
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black leading-[0.95]">
                                Venda mais, com <br />
                                menos esforço e <br />
                                mais impacto
                            </h2>
                        </div>

                        {/* Right Column: List */}
                        <div className="flex-1 flex flex-col gap-10 justify-center">
                            {BENEFITS.map((benefit, i) => (
                                <div key={i} className="flex gap-5 group">
                                    <div className="shrink-0 mt-1">
                                        <benefit.icon className="w-6 h-6 text-black stroke-[1.5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-1 group-hover:underline decoration-1 underline-offset-4 transition-all">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-neutral-500 text-sm leading-relaxed font-medium max-w-sm">
                                            {benefit.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials (Anonymous) */}
            <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                        Resultados que Falam por Si
                    </h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        Profissionais de elite usam nossa tecnologia para garantir resultados. <br />
                        Privacidade total: seus segredos continuam seus.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="w-12 h-12 text-white" />
                            </div>

                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white mb-1">{t.role}</div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider">{t.company}</div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wide">
                                    {t.metric}
                                </div>
                            </div>

                            <p className="text-neutral-300 text-sm leading-relaxed italic relative z-10">
                                "{t.quote}"
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-32 px-6 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter text-white">
                        Pare de Perder Oportunidades.
                    </h2>
                    <p className="text-neutral-400 text-xl mb-12 max-w-2xl mx-auto font-medium">
                        Seus concorrentes já estão usando IA. <br />
                        Você vai ficar para trás ou vai assumir o controle?
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onOpenLiveCoach}
                            className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-extrabold text-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:scale-105"
                        >
                            <Zap className="w-6 h-6 fill-current" />
                            QUERO VANTAGEM AGORA
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 py-24 px-6 max-w-3xl mx-auto">
                <div className="text-center mb-4">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.3em]">Perguntas</span>
                </div>
                <h2 className="text-3xl font-bold text-center mb-4">Alguma dúvida? Aqui está a resposta</h2>
                <p className="text-center text-neutral-500 text-sm mb-12">
                    Ainda ficou com alguma dúvida? Mande um email para <a href="mailto:help@interviewai.com" className="text-white hover:underline">help@interviewai.com</a>
                </p>
                <div className="space-y-4">
                    {FAQs.map((faq, i) => (
                        <div
                            key={i}
                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openFaq === i
                                ? 'bg-neutral-900 border-white/20'
                                : 'bg-transparent border-white/5 hover:border-white/10'
                                }`}
                        >
                            <button
                                onClick={() => toggleFaq(i)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className={`font-semibold ${openFaq === i ? 'text-white' : 'text-neutral-400'}`}>
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-white' : 'text-neutral-500'
                                        }`}
                                />
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out grid ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-6 pb-6 text-neutral-400 text-sm leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-neutral-950 text-center">
                <div className="flex items-center justify-center gap-2 mb-8 opacity-50">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold tracking-tight">InterviewAI</span>
                </div>
                <div className="flex flex-wrap justify-center gap-8 text-sm text-neutral-500 mb-8">
                    <a href="#" className="hover:text-white transition-colors">Termos</a>
                    <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">GitHub</a>
                </div>
                <p className="text-xs text-neutral-600">
                    © 2025 InterviewAI. Construído com ❤️ para quem vende, lidera e apresenta.
                </p>
            </footer>
        </div>
    );
}
