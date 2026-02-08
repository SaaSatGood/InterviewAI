"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from './ui/Button';
import { POSITIONS, STACKS, DIFFICULTIES, SOFT_SKILLS, BUSINESS_TOPICS, MODERN_PRACTICES } from '@/lib/constants';
import { LANGUAGES, Language, detectBrowserLanguage } from '@/lib/i18n';
import {
    ChevronRight, ChevronLeft, Code2, Briefcase, GraduationCap, Search, Sparkles,
    Layout, Server, Layers, Smartphone, Cloud, Database, Brain, TestTube, Shield,
    Activity, Building, Gamepad, Link, Rocket, Users, Target, Zap, Star,
    Gift, CreditCard, ArrowRight, Globe, Check, Heart, TrendingUp, Wrench, CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';

// Icon mapping for positions
const POSITION_ICONS: Record<string, React.ElementType> = {
    frontend: Layout,
    backend: Server,
    fullstack: Layers,
    mobile: Smartphone,
    devops: Cloud,
    datascience: Database,
    'ml-engineer': Brain,
    qa: TestTube,
    security: Shield,
    sre: Activity,
    architect: Building,
    'product-manager': Briefcase,
    'game-developer': Gamepad,
    blockchain: Link,
};

interface InterviewSetupProps {
    onOpenApiKeyModal: () => void;
}

export function InterviewSetup({ onOpenApiKeyModal }: InterviewSetupProps) {
    const { setUserProfile, language, setLanguage, t, isConfigured } = useAppStore();
    const [step, setStep] = useState(0);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
    const [selectedSoftSkills, setSelectedSoftSkills] = useState<string[]>([]);
    const [selectedBusinessTopics, setSelectedBusinessTopics] = useState<string[]>([]);
    const [selectedModernPractices, setSelectedModernPractices] = useState<string[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showLangMenu, setShowLangMenu] = useState(false);

    useEffect(() => {
        if (!language) {
            setLanguage(detectBrowserLanguage());
        }
    }, [language, setLanguage]);

    const handleStart = () => {
        if (selectedPosition && selectedStacks.length > 0 && selectedDifficulty) {
            setUserProfile({
                position: selectedPosition,
                stacks: selectedStacks,
                level: selectedDifficulty,
                softSkills: selectedSoftSkills,
                businessTopics: selectedBusinessTopics,
                modernPractices: selectedModernPractices,
            });
        }
    };

    const handleStartInterview = () => {
        if (!isConfigured()) {
            onOpenApiKeyModal();
            return;
        }
        setStep(1);
    };

    const toggleSelection = (id: string, selected: string[], setSelected: (val: string[]) => void) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const filteredPositions = useMemo(() => {
        if (!searchTerm) return POSITIONS;
        return POSITIONS.filter(p =>
            p.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const currentStacks = STACKS[selectedPosition as keyof typeof STACKS] || [];
    const filteredStacks = useMemo(() => {
        if (!searchTerm) return currentStacks;
        return currentStacks.filter(s =>
            s.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, currentStacks]);

    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.02 } }
    };

    const staggerItem = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    // Landing Page
    if (step === 0) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neutral-800/20 rounded-full blur-3xl"></div>

                {/* Language Selector */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="relative">
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="text-base">{LANGUAGES.find(l => l.id === language)?.flag}</span>
                        </button>

                        <AnimatePresence>
                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="absolute right-0 mt-2 bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden z-50 min-w-[140px] shadow-xl"
                                    >
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => { setLanguage(lang.id as Language); setShowLangMenu(false); }}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 transition-colors text-left",
                                                    language === lang.id ? "text-white bg-neutral-800" : "text-neutral-400"
                                                )}
                                            >
                                                <span className="text-lg">{lang.flag}</span>
                                                <span className="text-sm font-medium">{lang.label}</span>
                                                {language === lang.id && <Check className="w-3.5 h-3.5 text-white ml-auto" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 text-center max-w-3xl mx-auto"
                >
                    {/* Badges */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 text-xs font-medium">
                            <Gift className="w-3 h-3" /> {t('landing.free')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 text-xs font-medium">
                            <CreditCard className="w-3 h-3" /> {t('landing.noAccount')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 text-xs font-medium">
                            <Star className="w-3 h-3" /> FAANG-Level
                        </span>
                    </motion.div>

                    {/* Logo */}
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-8">
                        <Sparkles className="w-8 h-8 text-neutral-900" />
                    </motion.div>

                    {/* Title */}
                    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-semibold text-white mb-4 tracking-tight">
                        Interview<span className="text-neutral-500">AI</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-lg md:text-xl text-neutral-400 mb-3 max-w-xl mx-auto">
                        {t('landing.subtitle')}
                    </motion.p>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-neutral-500 mb-10 max-w-lg mx-auto">
                        {t('landing.description')}
                    </motion.p>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-12">
                        <Button onClick={handleStartInterview} size="lg" className="px-8">
                            {t('landing.cta')} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <p className="mt-3 text-xs text-neutral-600">
                            {language === 'pt' ? 'Comece em segundos' : language === 'es' ? 'Comienza en segundos' : 'Start in seconds'}
                        </p>
                    </motion.div>

                    {/* Features */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                        {[
                            { icon: Users, label: t('landing.feature.interviewers'), desc: t('landing.feature.interviewersDesc') },
                            { icon: Target, label: t('landing.feature.roles'), desc: t('landing.feature.rolesDesc') },
                            { icon: Rocket, label: t('landing.feature.stacks'), desc: t('landing.feature.stacksDesc') },
                            { icon: Zap, label: t('landing.feature.feedback'), desc: t('landing.feature.feedbackDesc') },
                        ].map((f, i) => (
                            <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-left">
                                <f.icon className="w-5 h-5 text-neutral-500 mb-2" />
                                <p className="text-sm font-medium text-neutral-200">{f.label}</p>
                                <p className="text-xs text-neutral-500">{f.desc}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center gap-10">
                        {[
                            { value: '14+', label: t('landing.stats.positions') },
                            { value: '100+', label: t('landing.stats.stacks') },
                            { value: '5', label: t('landing.stats.levels') },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl font-semibold text-white">{s.value}</p>
                                <p className="text-xs text-neutral-500">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Setup Steps
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
            <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-neutral-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-white">{t('setup.title')}</h1>
                            <p className="text-sm text-neutral-500">{t('setup.step')} {step} {t('setup.of')} 4</p>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={clsx("w-8 h-1 rounded-full transition-colors", s <= step ? "bg-white" : "bg-neutral-800")} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Position */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-800 rounded-lg"><Briefcase className="w-5 h-5 text-neutral-400" /></div>
                                    <h2 className="text-base font-medium text-white">{t('setup.selectRole')}</h2>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder={t('setup.searchRoles')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                                    />
                                </div>

                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">
                                    {filteredPositions.map((pos) => {
                                        const Icon = POSITION_ICONS[pos.id] || Briefcase;
                                        return (
                                            <motion.button
                                                key={pos.id}
                                                variants={staggerItem}
                                                onClick={() => { setSelectedPosition(pos.id); setSelectedStacks([]); setSearchTerm(''); }}
                                                className={clsx(
                                                    "p-3 rounded-lg border text-left transition-colors flex items-center gap-3",
                                                    selectedPosition === pos.id
                                                        ? "border-white bg-neutral-800 text-white"
                                                        : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                                                )}
                                            >
                                                <Icon className="w-4 h-4 shrink-0" />
                                                <span className="text-sm font-medium truncate">{pos.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                <div className="flex justify-between pt-3">
                                    <Button variant="ghost" onClick={() => setStep(0)}><ChevronLeft className="mr-1 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => { setStep(2); setSearchTerm(''); }} disabled={!selectedPosition}>{t('setup.next')} <ChevronRight className="ml-1 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Stack (Multi-select) */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-800 rounded-lg"><Code2 className="w-5 h-5 text-neutral-400" /></div>
                                        <div>
                                            <h2 className="text-base font-medium text-white">{t('setup.selectStack')}</h2>
                                            <p className="text-xs text-neutral-500">{language === 'pt' ? 'Selecione várias tecnologias' : language === 'es' ? 'Selecciona varias tecnologías' : 'Select multiple technologies'}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded">{selectedStacks.length} selected</span>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder={t('setup.searchTech')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
                                    />
                                </div>

                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto">
                                    {filteredStacks.map((stack) => {
                                        const isSelected = selectedStacks.includes(stack.id);
                                        return (
                                            <motion.button
                                                key={stack.id}
                                                variants={staggerItem}
                                                onClick={() => toggleSelection(stack.id, selectedStacks, setSelectedStacks)}
                                                className={clsx(
                                                    "p-3 rounded-lg border text-left transition-colors flex items-center gap-2",
                                                    isSelected
                                                        ? "border-white bg-neutral-800 text-white"
                                                        : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                                                )}
                                            >
                                                {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                                                <span className="text-sm font-medium truncate">{stack.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                <div className="flex justify-between pt-3">
                                    <Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft className="mr-1 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => { setStep(3); setSearchTerm(''); }} disabled={selectedStacks.length === 0}>{t('setup.next')} <ChevronRight className="ml-1 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Soft Skills, Business Topics, Modern Practices */}
                        {step === 3 && (
                            <motion.div key="step3" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-800 rounded-lg"><Heart className="w-5 h-5 text-neutral-400" /></div>
                                    <div>
                                        <h2 className="text-base font-medium text-white">{language === 'pt' ? 'Competências Complementares' : language === 'es' ? 'Competencias Complementarias' : 'Complementary Skills'}</h2>
                                        <p className="text-xs text-neutral-500">{language === 'pt' ? 'Opcional - para entrevista completa' : language === 'es' ? 'Opcional - para entrevista completa' : 'Optional - for complete interview'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {/* Soft Skills */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-neutral-500" />
                                            <span className="text-sm font-medium text-neutral-300">Soft Skills</span>
                                            <span className="text-xs text-neutral-500">({selectedSoftSkills.length})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {SOFT_SKILLS.map((skill) => {
                                                const isSelected = selectedSoftSkills.includes(skill.id);
                                                return (
                                                    <button
                                                        key={skill.id}
                                                        onClick={() => toggleSelection(skill.id, selectedSoftSkills, setSelectedSoftSkills)}
                                                        className={clsx(
                                                            "p-2 rounded-lg border text-left transition-colors text-sm",
                                                            isSelected
                                                                ? "border-white bg-neutral-800 text-white"
                                                                : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                                                        )}
                                                    >
                                                        {skill.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Business Topics */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-neutral-500" />
                                            <span className="text-sm font-medium text-neutral-300">{language === 'pt' ? 'Lógica de Negócios' : language === 'es' ? 'Lógica de Negocios' : 'Business Logic'}</span>
                                            <span className="text-xs text-neutral-500">({selectedBusinessTopics.length})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {BUSINESS_TOPICS.map((topic) => {
                                                const isSelected = selectedBusinessTopics.includes(topic.id);
                                                return (
                                                    <button
                                                        key={topic.id}
                                                        onClick={() => toggleSelection(topic.id, selectedBusinessTopics, setSelectedBusinessTopics)}
                                                        className={clsx(
                                                            "p-2 rounded-lg border text-left transition-colors text-sm",
                                                            isSelected
                                                                ? "border-white bg-neutral-800 text-white"
                                                                : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                                                        )}
                                                    >
                                                        {topic.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Modern Practices */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wrench className="w-4 h-4 text-neutral-500" />
                                            <span className="text-sm font-medium text-neutral-300">{language === 'pt' ? 'Práticas Modernas' : language === 'es' ? 'Prácticas Modernas' : 'Modern Practices'}</span>
                                            <span className="text-xs text-neutral-500">({selectedModernPractices.length})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {MODERN_PRACTICES.map((practice) => {
                                                const isSelected = selectedModernPractices.includes(practice.id);
                                                return (
                                                    <button
                                                        key={practice.id}
                                                        onClick={() => toggleSelection(practice.id, selectedModernPractices, setSelectedModernPractices)}
                                                        className={clsx(
                                                            "p-2 rounded-lg border text-left transition-colors text-sm",
                                                            isSelected
                                                                ? "border-white bg-neutral-800 text-white"
                                                                : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                                                        )}
                                                    >
                                                        {practice.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-3">
                                    <Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft className="mr-1 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => setStep(4)}>{t('setup.next')} <ChevronRight className="ml-1 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Difficulty */}
                        {step === 4 && (
                            <motion.div key="step4" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-800 rounded-lg"><GraduationCap className="w-5 h-5 text-neutral-400" /></div>
                                    <h2 className="text-base font-medium text-white">{t('setup.selectLevel')}</h2>
                                </div>

                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                                    {DIFFICULTIES.map((diff, idx) => (
                                        <motion.button
                                            key={diff.id}
                                            variants={staggerItem}
                                            onClick={() => setSelectedDifficulty(diff.id)}
                                            className={clsx(
                                                "w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-4",
                                                selectedDifficulty === diff.id ? "border-white bg-neutral-800" : "border-neutral-800 hover:border-neutral-700"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium",
                                                selectedDifficulty === diff.id ? "bg-white text-neutral-900" : "bg-neutral-800 text-neutral-400"
                                            )}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className={clsx("text-sm font-medium", selectedDifficulty === diff.id ? "text-white" : "text-neutral-300")}>{diff.label}</div>
                                                <div className="text-xs text-neutral-500">{diff.description}</div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>

                                {/* Summary */}
                                {selectedPosition && selectedStacks.length > 0 && selectedDifficulty && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                                        <p className="text-sm text-neutral-300">
                                            <span className="text-neutral-500">{t('setup.ready')}</span>{' '}
                                            {DIFFICULTIES.find(d => d.id === selectedDifficulty)?.label}{' '}
                                            {POSITIONS.find(p => p.id === selectedPosition)?.label}{' '}
                                            <span className="text-white">({selectedStacks.length} {language === 'pt' ? 'tecnologias' : language === 'es' ? 'tecnologías' : 'technologies'})</span>
                                            {selectedSoftSkills.length > 0 && <span className="text-neutral-400"> + {selectedSoftSkills.length} soft skills</span>}
                                            {selectedBusinessTopics.length > 0 && <span className="text-neutral-400"> + {selectedBusinessTopics.length} business</span>}
                                        </p>
                                    </motion.div>
                                )}

                                <div className="flex justify-between pt-3">
                                    <Button variant="ghost" onClick={() => setStep(3)}><ChevronLeft className="mr-1 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={handleStart} disabled={!selectedDifficulty}>{t('setup.start')} <ArrowRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
