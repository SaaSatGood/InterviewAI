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
    Gift, CreditCard, ArrowRight, Globe, Check, Heart, TrendingUp, Wrench, CheckCircle2, FileText, Headphones, History as HistoryIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { ResumeUpload } from './ResumeUpload';
import { JobContext } from './JobContext';

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
    onOpenLiveCoach?: () => void;
}

export function InterviewSetup({ onOpenApiKeyModal, onOpenLiveCoach }: InterviewSetupProps) {
    const { setUserProfile, language, setLanguage, t, isConfigured, lastProfile, setLastProfile } = useAppStore();
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
            const profile = {
                position: selectedPosition,
                stacks: selectedStacks,
                level: selectedDifficulty,
                softSkills: selectedSoftSkills,
                businessTopics: selectedBusinessTopics,
                modernPractices: selectedModernPractices,
            };
            setLastProfile(profile);
            setUserProfile(profile);
        }
    };

    const handleQuickStart = () => {
        if (!isConfigured()) {
            onOpenApiKeyModal();
            return;
        }
        const quickProfile = {
            position: 'fullstack',
            stacks: ['react', 'node'],
            level: 'mid-level',
            softSkills: ['communication', 'problem-solving'],
            businessTopics: [],
            modernPractices: ['agile', 'clean-code'],
        };
        setLastProfile(quickProfile);
        setUserProfile(quickProfile);
    };

    const handleRepeatLast = () => {
        if (!isConfigured()) {
            onOpenApiKeyModal();
            return;
        }
        if (lastProfile) {
            setUserProfile(lastProfile);
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
        hidden: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
        visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.98, filter: 'blur(10px)', transition: { duration: 0.3 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
    };

    const staggerItem = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // Landing Page
    if (step === 0) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950"></div>

                {/* Ambient Glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Language Selector */}
                <div className="absolute top-6 right-6 z-20">
                    <div className="relative">
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-neutral-300 hover:text-white transition-all shadow-lg"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="text-base">{LANGUAGES.find(l => l.id === language)?.flag}</span>
                        </button>

                        <AnimatePresence>
                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                        className="absolute right-0 mt-2 bg-neutral-900/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-50 min-w-[160px] shadow-2xl"
                                    >
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => { setLanguage(lang.id as Language); setShowLangMenu(false); }}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left",
                                                    language === lang.id ? "text-white bg-white/5" : "text-neutral-400"
                                                )}
                                            >
                                                <span className="text-xl">{lang.flag}</span>
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
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center max-w-3xl mx-auto"
                >
                    {/* Badges */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-3 mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-neutral-300 text-xs font-medium backdrop-blur-sm">
                            <Gift className="w-3 h-3 text-emerald-400" /> {t('landing.free')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-neutral-300 text-xs font-medium backdrop-blur-sm">
                            <CreditCard className="w-3 h-3 text-indigo-400" /> {t('landing.noAccount')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-neutral-300 text-xs font-medium backdrop-blur-sm">
                            <Star className="w-3 h-3 text-amber-400" /> FAANG-Level
                        </span>
                    </motion.div>

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15, type: 'spring' }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-white to-neutral-200 rounded-3xl mb-8 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <Sparkles className="w-10 h-10 text-neutral-900" />
                    </motion.div>

                    {/* Title */}
                    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        Interview<span className="bg-gradient-to-r from-neutral-400 to-neutral-600 bg-clip-text text-transparent">AI</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-xl text-neutral-400 mb-5 max-w-xl mx-auto leading-relaxed">
                        {t('landing.subtitle')}
                    </motion.p>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-neutral-500 mb-10 max-w-lg mx-auto">
                        {t('landing.description')}
                    </motion.p>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-16">
                        <motion.div
                            className="relative inline-block"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <Button
                                onClick={handleStartInterview}
                                size="lg"
                                className="relative px-10 h-14 bg-white text-neutral-950 hover:bg-neutral-100 rounded-xl font-semibold text-lg shadow-xl"
                            >
                                <span className="relative z-10">{t('landing.cta')}</span>
                                <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
                            </Button>
                        </motion.div>

                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex flex-wrap justify-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleQuickStart}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                                >
                                    <Zap className="w-4 h-4" />
                                    {t('landing.quickStart')}
                                </motion.button>

                                {lastProfile && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRepeatLast}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 transition-all text-sm font-medium"
                                    >
                                        <HistoryIcon className="w-4 h-4" />
                                        {t('landing.repeatLast')}
                                    </motion.button>
                                )}
                            </div>

                            {onOpenLiveCoach && (
                                <motion.button
                                    onClick={onOpenLiveCoach}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-300 transition-all group shadow-lg"
                                >
                                    <Headphones className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                                    <span className="text-sm font-medium">{t('landing.liveCoach')}</span>
                                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/20">NEW</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-white/5 pt-8">
                        {[
                            { value: '14+', label: t('landing.stats.positions') },
                            { value: '100+', label: t('landing.stats.stacks') },
                            { value: '5', label: t('landing.stats.levels') },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="text-center"
                            >
                                <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Setup Steps
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950"></div>

            <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="w-full max-w-3xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-white tracking-tight">{t('setup.title')}</h1>
                            <p className="text-sm text-neutral-500 mt-1">{t('setup.step')} {step} {t('setup.of')} 5</p>
                        </div>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <div key={s} className={clsx("w-8 h-1 rounded-full transition-all duration-300", s <= step ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-neutral-800")} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 min-h-[500px] flex flex-col relative">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Position */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><Briefcase className="w-6 h-6 text-indigo-400" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.selectRole')}</h2>
                                        <p className="text-sm text-neutral-500">{t('setup.searchRoles')}</p>
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Search for a role..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 flex-1 content-start">
                                    {filteredPositions.map((pos) => {
                                        const Icon = POSITION_ICONS[pos.id] || Briefcase;
                                        const isSelected = selectedPosition === pos.id;
                                        return (
                                            <motion.button
                                                key={pos.id}
                                                variants={staggerItem}
                                                onClick={() => { setSelectedPosition(pos.id); setSelectedStacks([]); setSearchTerm(''); }}
                                                className={clsx(
                                                    "p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 group",
                                                    isSelected
                                                        ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]"
                                                        : "border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-neutral-200"
                                                )}
                                            >
                                                <div className={clsx("p-2 rounded-lg transition-colors", isSelected ? "bg-indigo-500/20" : "bg-white/5 group-hover:bg-white/10")}>
                                                    <Icon className={clsx("w-5 h-5", isSelected ? "text-indigo-300" : "text-neutral-500 group-hover:text-neutral-300")} />
                                                </div>
                                                <span className="text-sm font-medium truncate">{pos.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(0)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => { setStep(2); setSearchTerm(''); }} disabled={!selectedPosition} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Stack */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Code2 className="w-6 h-6 text-emerald-400" /></div>
                                        <div>
                                            <h2 className="text-xl font-medium text-white">{t('setup.selectStack')}</h2>
                                            <p className="text-sm text-neutral-500">{t('setup.selectMultiple')}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                                        {selectedStacks.length} {t('setup.selected')}
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder="Search technology..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-2 flex-1 content-start">
                                    {filteredStacks.map((stack) => {
                                        const isSelected = selectedStacks.includes(stack.id);
                                        return (
                                            <motion.button
                                                key={stack.id}
                                                variants={staggerItem}
                                                onClick={() => toggleSelection(stack.id, selectedStacks, setSelectedStacks)}
                                                className={clsx(
                                                    "p-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-3",
                                                    isSelected
                                                        ? "border-emerald-500/50 bg-emerald-500/10 text-white shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                                                        : "border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-neutral-200"
                                                )}
                                            >
                                                <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center border", isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-700 bg-neutral-800")}>
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </div>
                                                <span className="text-sm font-medium truncate">{stack.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => { setStep(3); setSearchTerm(''); }} disabled={selectedStacks.length === 0} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Skills */}
                        {step === 3 && (
                            <motion.div key="step3" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20"><Heart className="w-6 h-6 text-pink-400" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.complementarySkills')}</h2>
                                        <p className="text-sm text-neutral-500">{t('setup.complementaryDesc')}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 overflow-y-auto pr-2 flex-1">
                                    {/* Soft Skills */}
                                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-4 h-4 text-pink-400" />
                                            <span className="text-sm font-semibold text-neutral-200">{t('setup.softSkills')}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {SOFT_SKILLS.map((skill) => {
                                                const isSelected = selectedSoftSkills.includes(skill.id);
                                                return (
                                                    <button
                                                        key={skill.id}
                                                        onClick={() => toggleSelection(skill.id, selectedSoftSkills, setSelectedSoftSkills)}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-lg border text-sm transition-all duration-200",
                                                            isSelected
                                                                ? "border-pink-500/50 bg-pink-500/10 text-white"
                                                                : "border-white/5 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200"
                                                        )}
                                                    >
                                                        {skill.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Business Topics */}
                                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <TrendingUp className="w-4 h-4 text-amber-400" />
                                            <span className="text-sm font-semibold text-neutral-200">{t('setup.businessLogic')}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {BUSINESS_TOPICS.map((topic) => {
                                                const isSelected = selectedBusinessTopics.includes(topic.id);
                                                return (
                                                    <button
                                                        key={topic.id}
                                                        onClick={() => toggleSelection(topic.id, selectedBusinessTopics, setSelectedBusinessTopics)}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-lg border text-sm transition-all duration-200",
                                                            isSelected
                                                                ? "border-amber-500/50 bg-amber-500/10 text-white"
                                                                : "border-white/5 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200"
                                                        )}
                                                    >
                                                        {topic.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Modern Practices */}
                                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wrench className="w-4 h-4 text-cyan-400" />
                                            <span className="text-sm font-semibold text-neutral-200">{t('setup.modernPractices')}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {MODERN_PRACTICES.map((practice) => {
                                                const isSelected = selectedModernPractices.includes(practice.id);
                                                return (
                                                    <button
                                                        key={practice.id}
                                                        onClick={() => toggleSelection(practice.id, selectedModernPractices, setSelectedModernPractices)}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-lg border text-sm transition-all duration-200",
                                                            isSelected
                                                                ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                                                                : "border-white/5 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200"
                                                        )}
                                                    >
                                                        {practice.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(2)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => setStep(4)} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Level */}
                        {step === 4 && (
                            <motion.div key="step4" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20"><GraduationCap className="w-6 h-6 text-violet-400" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.selectLevel')}</h2>
                                        <p className="text-sm text-neutral-500">Determine the complexity of questions.</p>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1">
                                    {DIFFICULTIES.map((diff, idx) => (
                                        <motion.button
                                            key={diff.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => setSelectedDifficulty(diff.id)}
                                            className={clsx(
                                                "w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 group hover:scale-[1.01]",
                                                selectedDifficulty === diff.id
                                                    ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]"
                                                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-110",
                                                selectedDifficulty === diff.id ? "bg-violet-500 text-white" : "bg-neutral-800 text-neutral-500"
                                            )}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className={clsx("text-base font-semibold", selectedDifficulty === diff.id ? "text-white" : "text-neutral-300")}>{diff.label}</div>
                                                <div className="text-sm text-neutral-500">{diff.description}</div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(3)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => setStep(5)} disabled={!selectedDifficulty} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Context */}
                        {step === 5 && (
                            <motion.div key="step5" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20"><FileText className="w-6 h-6 text-blue-400" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.personalizeTitle')}</h2>
                                        <p className="text-sm text-neutral-500">{t('setup.personalizeDesc')}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 overflow-y-auto pr-2 flex-1">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                                        <ResumeUpload />
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                                        <JobContext />
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(4)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                                        <Button onClick={handleStart} className="relative bg-white text-neutral-900 hover:bg-neutral-100 px-8">{t('setup.start')} <ArrowRight className="ml-2 w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
