"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from './ui/Button';
import { POSITIONS, STACKS, DIFFICULTIES, SOFT_SKILLS, BUSINESS_TOPICS, MODERN_PRACTICES } from '@/lib/constants';
import { LANGUAGES, Language, detectBrowserLanguage } from '@/lib/i18n';
import {
    ChevronRight, ChevronLeft, Code2, Briefcase, GraduationCap, Search, Sparkles,
    Layout, Server, Layers, Smartphone, Cloud, Database, Brain, TestTube, Shield,
    Activity, Building, Gamepad, Link as LinkIcon, Rocket, Users, Target, Zap, Star,
    Gift, CreditCard, ArrowRight, Globe, Check, Heart, TrendingUp, Wrench, CheckCircle2, FileText, Headphones, History as HistoryIcon,
    User, LogIn, Mic, Settings, Play
} from 'lucide-react';
import { clsx } from 'clsx';
import { ResumeUpload } from './ResumeUpload';
import { JobContext } from './JobContext';
import { LandingPage } from './LandingPage';

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
    blockchain: LinkIcon,
    sdr: Target,
    bdr: TrendingUp,
    'account-executive': Briefcase,
    'sales-manager': Users,
    'customer-success': Heart,
    'customer-support': Headphones,
    'technical-support': Wrench,
    'support-lead': Activity,
};

interface InterviewSetupProps {
    onOpenApiKeyModal: () => void;
    onOpenLiveCoach?: () => void;
}

export function InterviewSetup({ onOpenApiKeyModal, onOpenLiveCoach }: InterviewSetupProps) {
    const { userProfile, setUserProfile, language, setLanguage, t, isConfigured, lastProfile, setLastProfile } = useAppStore();
    const [step, setStep] = useState(0);
    const [selectedArea, setSelectedArea] = useState<'tech' | 'sales' | 'support' | ''>('');
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
        if (selectedArea && selectedPosition && selectedStacks.length > 0 && selectedDifficulty) {
            const profile = {
                category: selectedArea as any,
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
            category: 'tech' as const,
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
        const byArea = POSITIONS.filter(p => !selectedArea || p.category === selectedArea);
        if (!searchTerm) return byArea;
        return byArea.filter(p =>
            p.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, selectedArea]);

    const currentStacks = STACKS[selectedPosition as keyof typeof STACKS] || [];
    const filteredStacks = useMemo(() => {
        if (!searchTerm) return currentStacks;
        return currentStacks.filter(s =>
            s.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, currentStacks]);

    const fadeIn: Variants = {
        hidden: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
        visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.98, filter: 'blur(10px)', transition: { duration: 0.3 } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
    };

    const staggerItem: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // Landing Page
    if (step === 0) {
        return (
            <LandingPage
                onStartInterview={handleStartInterview}
                onOpenLiveCoach={onOpenLiveCoach || (() => { })}
                onOpenApiKey={onOpenApiKeyModal}
            />
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
                            <p className="text-sm text-neutral-500 mt-1">{t('setup.step')} {step} {t('setup.of')} 6</p>
                        </div>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map(s => (
                                <div key={s} className={clsx("w-8 h-1 rounded-full transition-all duration-300", s <= step ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-neutral-800")} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 min-h-[500px] flex flex-col relative">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Area */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Target className="w-6 h-6 text-white" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.selectArea')}</h2>
                                        <p className="text-sm text-neutral-500">{t('setup.searchAreas')}</p>
                                    </div>
                                </div>

                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 flex-1 content-start">
                                    {[
                                        { id: 'tech', label: t('area.tech'), icon: Code2, desc: 'Software, Data, DevOps & IA', color: 'neutral' },
                                        { id: 'sales', label: t('area.sales'), icon: TrendingUp, desc: 'SDR, BDR, AE & Success', color: 'neutral' },
                                        { id: 'support', label: t('area.support'), icon: Headphones, desc: 'Support & Technical Help', color: 'neutral' },
                                    ].map((area) => {
                                        const Icon = area.icon;
                                        const isSelected = selectedArea === area.id;
                                        return (
                                            <motion.button
                                                key={area.id}
                                                variants={staggerItem}
                                                onClick={() => { setSelectedArea(area.id as any); setSelectedPosition(''); setSelectedStacks([]); }}
                                                className={clsx(
                                                    "p-6 rounded-2xl border text-left transition-all duration-300 flex items-center gap-6 group hover:translate-x-1",
                                                    isSelected
                                                        ? "border-white/20 bg-white/10 text-white shadow-xl"
                                                        : "border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-neutral-200"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "p-4 rounded-xl transition-colors",
                                                    isSelected ? "bg-white/10" : "bg-white/5 group-hover:bg-white/10"
                                                )}>
                                                    <Icon className={clsx("w-8 h-8", isSelected ? "text-white" : "text-neutral-500 group-hover:text-neutral-300")} />
                                                </div>
                                                <div>
                                                    <span className="text-lg font-bold block">{area.label}</span>
                                                    <span className="text-sm text-neutral-500">{area.desc}</span>
                                                </div>
                                                {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />}
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(0)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => setStep(2)} disabled={!selectedArea} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Position */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Briefcase className="w-6 h-6 text-white" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.selectRole')}</h2>
                                        <p className="text-sm text-neutral-500">{t('setup.searchRoles')}</p>
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                    <input
                                        type="text"
                                        placeholder={t('setup.searchRolePlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
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
                                                        ? "border-white bg-white/10 text-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
                                                        : "border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-neutral-200"
                                                )}
                                            >
                                                <div className={clsx("p-2 rounded-lg transition-colors", isSelected ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10")}>
                                                    <Icon className={clsx("w-5 h-5", isSelected ? "text-white" : "text-neutral-500 group-hover:text-neutral-300")} />
                                                </div>
                                                <span className="text-sm font-medium truncate">{pos.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => { setStep(3); setSearchTerm(''); }} disabled={!selectedPosition} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Stack */}
                        {step === 3 && (
                            <motion.div key="step3" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Code2 className="w-6 h-6 text-white" /></div>
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
                                        placeholder={t('setup.searchTech')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
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
                                                        ? "border-white bg-white/10 text-white shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)]"
                                                        : "border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-neutral-200"
                                                )}
                                            >
                                                <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center border", isSelected ? "border-white bg-white text-black" : "border-neutral-700 bg-neutral-800")}>
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </div>
                                                <span className="text-sm font-medium truncate">{stack.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>

                                <div className="flex justify-between pt-6 border-t border-white/5 mt-4">
                                    <Button variant="ghost" onClick={() => setStep(2)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => { setStep(4); setSearchTerm(''); }} disabled={selectedStacks.length === 0} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Skills */}
                        {step === 4 && (
                            <motion.div key="step4" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Heart className="w-6 h-6 text-white" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.complementarySkills')}</h2>
                                        <p className="text-sm text-neutral-500">{t('setup.complementaryDesc')}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 overflow-y-auto pr-2 flex-1">
                                    {/* Soft Skills */}
                                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-4 h-4 text-white" />
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
                                                                ? "border-white bg-white/10 text-white"
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
                                            <TrendingUp className="w-4 h-4 text-white" />
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
                                                                ? "border-white bg-white/10 text-white"
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
                                            <Wrench className="w-4 h-4 text-white" />
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
                                                                ? "border-white bg-white/10 text-white"
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
                                    <Button variant="ghost" onClick={() => setStep(3)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => setStep(5)} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Level */}
                        {step === 5 && (
                            <motion.div key="step5" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10"><GraduationCap className="w-6 h-6 text-white" /></div>
                                    <div>
                                        <h2 className="text-xl font-medium text-white">{t('setup.selectLevel')}</h2>
                                        <p className="text-sm text-neutral-500">{t('setup.levelDescription')}</p>
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
                                                    ? "border-white bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
                                                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-110",
                                                selectedDifficulty === diff.id ? "bg-white text-black" : "bg-neutral-800 text-neutral-500"
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
                                    <Button variant="ghost" onClick={() => setStep(4)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <Button onClick={() => setStep(6)} disabled={!selectedDifficulty} className="bg-white text-neutral-900 hover:bg-neutral-200">{t('setup.next')} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: Context */}
                        {step === 6 && (
                            <motion.div key="step6" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10"><FileText className="w-6 h-6 text-white" /></div>
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
                                    <Button variant="ghost" onClick={() => setStep(5)} className="text-neutral-400 hover:text-white"><ChevronLeft className="mr-2 w-4 h-4" /> {t('setup.back')}</Button>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-white/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                                        <Button onClick={handleStart} className="relative bg-white text-black hover:bg-neutral-200 px-8 font-bold">{t('setup.start')} <ArrowRight className="ml-2 w-4 h-4" /></Button>
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
