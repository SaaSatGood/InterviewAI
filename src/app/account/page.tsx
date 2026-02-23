"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import {
    ArrowLeft, User, Lock, Coins, Loader2, LogOut, Camera,
    FileText, Briefcase, Key, UploadCloud, CheckCircle2,
    AlertCircle, Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'profile' | 'professional' | 'api' | 'security';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning';
    text: string;
    action?: 'reset_password';
}

export default function AccountSettings() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();

    const [activeTab, setActiveTab] = useState<TabId>('profile');

    const [displayName, setDisplayName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tokensUsed, setTokensUsed] = useState(0);

    const [companyDescription, setCompanyDescription] = useState('');
    const [openAiKey, setOpenAiKey] = useState('');
    const [anthropicKey, setAnthropicKey] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [resumeName, setResumeName] = useState('');

    // Auto-save typing states
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSavedDesc, setLastSavedDesc] = useState('');

    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isSavingApiKeys, setIsSavingApiKeys] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [showOpenAiKey, setShowOpenAiKey] = useState(false);
    const [showAnthropicKey, setShowAnthropicKey] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');

            const fetchSettings = async () => {
                try {
                    const docSnap = await getDoc(doc(db, 'users', user.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.companyDescription) {
                            setCompanyDescription(data.companyDescription);
                            setLastSavedDesc(data.companyDescription);
                        }
                        if (data.apiKeys?.openai) setOpenAiKey(data.apiKeys.openai);
                        if (data.apiKeys?.anthropic) setAnthropicKey(data.apiKeys.anthropic);
                        if (data.resumeUrl) setResumeUrl(data.resumeUrl);
                        if (data.resumeName) setResumeName(data.resumeName);
                    }
                } catch (error) {
                    console.error("Error fetching settings:", error);
                }
            };
            fetchSettings();

            const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
                if (docSnap.exists() && docSnap.data().tokensUsed !== undefined) {
                    setTokensUsed(docSnap.data().tokensUsed);
                }
                setIsLoadingData(false);
            }, (error) => {
                console.error("Error fetching user data:", error);
                setIsLoadingData(false);
            });

            return () => unsubscribe();
        }
    }, [user]);

    const addToast = (type: 'success' | 'error' | 'warning', text: string, action?: 'reset_password') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, text, action }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    };

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSavingName(true);
        try {
            await updateProfile(user, { displayName });
            addToast('success', 'Nome atualizado com sucesso.');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao atualizar nome.');
        } finally {
            setIsSavingName(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (newPassword.length < 6) {
            addToast('error', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            addToast('error', 'As senhas não coincidem.');
            return;
        }

        setIsSavingPassword(true);
        try {
            await updatePassword(user, newPassword);
            setNewPassword('');
            setConfirmPassword('');
            addToast('success', 'Sua senha foi atualizada com segurança.');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                addToast(
                    'warning',
                    'Sua sessão expirou por segurança. Faça login novamente ou redefina por e-mail.',
                    'reset_password'
                );
            } else {
                addToast('error', error.message || 'Erro ao atualizar senha.');
            }
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleSendResetEmail = async () => {
        if (!user || !user.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            addToast('success', 'E-mail enviado! Verifique sua caixa de entrada.');
        } catch (error: any) {
            addToast('error', error.message || 'Erro ao enviar e-mail.');
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith('image/')) {
            addToast('error', 'Apenas imagens (JPG, PNG) são permitidas.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            addToast('error', 'O avatar deve ter no máximo 2MB.');
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const storageRef = ref(storage, `users/${user.uid}/avatar`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateProfile(user, { photoURL: downloadURL });
            addToast('success', 'Avatar atualizado com sucesso.');
        } catch (error: any) {
            console.error("Upload error:", error);
            addToast('error', 'Falha ao atualizar avatar.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (file.size > 5 * 1024 * 1024) {
            addToast('error', 'O arquivo deve ter no máximo 5MB.');
            return;
        }

        setIsUploadingResume(true);
        try {
            const fileExtension = file.name.split('.').pop();
            const storageRef = ref(storage, `users/${user.uid}/resume.${fileExtension}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateDoc(doc(db, 'users', user.uid), {
                resumeUrl: downloadURL,
                resumeName: file.name
            });

            setResumeUrl(downloadURL);
            setResumeName(file.name);
            addToast('success', 'Currículo processado e salvo.');
        } catch (error: any) {
            console.error("Resume Upload error:", error);
            addToast('error', 'Erro ao enviar o currículo.');
        } finally {
            setIsUploadingResume(false);
            if (resumeInputRef.current) resumeInputRef.current.value = '';
        }
    };

    // Auto-save Contexto Profissional
    const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCompanyDescription(e.target.value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            saveContext(e.target.value);
        }, 1500);
    };

    const saveContext = async (text: string) => {
        if (!user || text === lastSavedDesc) return;
        setIsAutoSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), { companyDescription: text });
            setLastSavedDesc(text);
        } catch (error) {
            addToast('error', 'Erro ao salvar contexto automaticamente.');
        } finally {
            setIsAutoSaving(false);
        }
    };

    const handleUpdateApiKeys = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSavingApiKeys(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                'apiKeys.openai': openAiKey,
                'apiKeys.anthropic': anthropicKey,
            });
            addToast('success', 'Integrações atualizadas e criptografadas.');
        } catch (error: any) {
            addToast('error', 'Falha ao criptografar chaves.');
        } finally {
            setIsSavingApiKeys(false);
        }
    };

    if (authLoading || (!user && isLoadingData)) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-white/30 relative">

            {/* Toasts Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111] border border-white/10 shadow-2xl rounded-xl p-4 flex items-start gap-3 max-w-sm"
                        >
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />}

                            <div className="flex-1">
                                <p className="text-sm text-white/90">{toast.text}</p>
                                {toast.action === 'reset_password' && (
                                    <button
                                        onClick={handleSendResetEmail}
                                        className="mt-2 text-xs font-medium text-white/50 hover:text-white transition-colors underline underline-offset-2"
                                    >
                                        Enviar e-mail agora
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="max-w-[1200px] mx-auto min-h-screen flex flex-col md:flex-row">

                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 p-6 md:py-12 border-b md:border-b-0 md:border-r border-white/10 md:sticky top-0 h-auto md:h-screen overflow-y-auto">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10 group text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Voltar para o App
                    </button>

                    <h2 className="text-lg font-semibold mb-6">Configurações</h2>

                    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                        {[
                            { id: 'profile', icon: User, label: 'Perfil' },
                            { id: 'professional', icon: Briefcase, label: 'Contexto Profissional' },
                            { id: 'api', icon: Key, label: 'Traga sua Chave' },
                            { id: 'security', icon: Lock, label: 'Segurança' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabId)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 shrink-0" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 md:mt-auto md:absolute md:bottom-12 w-full md:w-[calc(100%-48px)]">
                        <div className="p-4 rounded-xl bg-[#111] border border-white/5 mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Tokens Usados</span>
                                <Coins className="w-3.5 h-3.5 text-white/50" />
                            </div>
                            <div className="text-xl font-bold text-white tracking-tight">
                                {isLoadingData ? '...' : tokensUsed.toLocaleString()}
                            </div>
                        </div>

                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            Sair da Conta
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-12 md:max-w-3xl">
                    <AnimatePresence mode="wait">

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-12"
                            >
                                <div>
                                    <h1 className="text-3xl font-bold mb-1 tracking-tight">Seu Perfil</h1>
                                    <p className="text-white/50 text-sm">Gerencie suas informações públicas e de identidade.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/10">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative w-24 h-24 rounded-full bg-[#111] border border-white/10 text-white/50 flex items-center justify-center text-3xl font-bold cursor-pointer group overflow-hidden shrink-0"
                                        >
                                            {isUploadingAvatar ? (
                                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                            ) : user.photoURL ? (
                                                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{(user.displayName || user.email || '?').charAt(0).toUpperCase()}</span>
                                            )}

                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-1">Avatar</h3>
                                            <p className="text-sm text-white/50 mb-3">Formatos recomendados: JPG, PNG. Máx 2MB.</p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingAvatar}
                                                className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/5"
                                            >
                                                Alterar Avatar
                                            </button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdateName} className="space-y-4">
                                        <div className="max-w-md">
                                            <label className="block text-sm font-medium text-white/70 mb-2">Nome de Exibição</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/30 text-sm"
                                                placeholder="João Silva"
                                            />
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isSavingName || displayName === user.displayName}
                                                className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* PROFESSIONAL TAB */}
                        {activeTab === 'professional' && (
                            <motion.div
                                key="professional"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-12"
                            >
                                <div>
                                    <h1 className="text-3xl font-bold mb-1 tracking-tight">Contexto Profissional</h1>
                                    <p className="text-white/50 text-sm">Forneça insumos para o Coach personalizar suas simulações.</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="max-w-xl">
                                        <label className="block text-sm font-medium text-white/70 mb-2">Upload de Currículo</label>
                                        <p className="text-white/50 text-sm mb-4">Adicione seu currículo para que o avaliador entenda seu histórico (Max 5MB, PDF/DOC).</p>

                                        <div className="p-4 border border-dashed border-white/20 rounded-xl bg-[#111] flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-white/40 transition-colors">
                                            <div className="flex items-center gap-4 overflow-hidden w-full">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 text-white/50 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium text-sm text-white truncate">{resumeName || 'Nenhum currículo selecionado'}</p>
                                                    {resumeUrl ? (
                                                        <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-white/50 hover:text-white transition-colors underline underline-offset-2">Visualizar arquivo enviado</a>
                                                    ) : (
                                                        <span className="text-xs text-white/30">Anexar um documento</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 w-full sm:w-auto">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="hidden"
                                                    ref={resumeInputRef}
                                                    onChange={handleResumeUpload}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => resumeInputRef.current?.click()}
                                                    disabled={isUploadingResume}
                                                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {isUploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                                    {resumeName ? 'Substituir' : 'Procurar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-xl">
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-sm font-medium text-white/70">Sobre Você / Sua Empresa</label>
                                            <span className="text-xs font-medium text-white/40 flex items-center gap-1">
                                                {isAutoSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</> : (companyDescription === lastSavedDesc && companyDescription !== '') ? <><CheckCircle2 className="w-3 h-3" /> Salvo automaticamente</> : null}
                                            </span>
                                        </div>
                                        <p className="text-white/50 text-sm mb-4">Descreva sua atuação, a empresa que trabalha e os produtos que vende. O Coach usará isso para simular objeções reais de prospectos.</p>
                                        <textarea
                                            value={companyDescription}
                                            onChange={handleContextChange}
                                            rows={6}
                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/30 text-sm resize-none"
                                            placeholder="Ex: Sou Executivo de Vendas em uma startup de SaaS focada em logística..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* API KEYS TAB */}
                        {activeTab === 'api' && (
                            <motion.div
                                key="api"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-12"
                            >
                                <div className="max-w-2xl">
                                    <h1 className="text-3xl font-bold mb-1 tracking-tight">Traga sua Chave (BYOK)</h1>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        Utilize a capacidade máxima da IA fornecendo sua própria chave de API da OpenAI ou Anthropic. Suas chaves são criptografadas, nunca armazenadas em logs, e usadas estritamente durante suas simulações.
                                    </p>
                                </div>

                                <form onSubmit={handleUpdateApiKeys} className="space-y-8 max-w-lg">
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <ShieldCheck className="w-4 h-4 text-white/40" />
                                                <label className="block text-sm font-medium text-white/70">OpenAI API Key</label>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showOpenAiKey ? "text" : "password"}
                                                    value={openAiKey}
                                                    onChange={(e) => setOpenAiKey(e.target.value)}
                                                    className="w-full bg-[#111] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/30 text-sm font-mono"
                                                    placeholder="sk-..."
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/70"
                                                    onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                                                >
                                                    {showOpenAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <ShieldCheck className="w-4 h-4 text-white/40" />
                                                <label className="block text-sm font-medium text-white/70">Anthropic API Key</label>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showAnthropicKey ? "text" : "password"}
                                                    value={anthropicKey}
                                                    onChange={(e) => setAnthropicKey(e.target.value)}
                                                    className="w-full bg-[#111] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/30 text-sm font-mono"
                                                    placeholder="sk-ant-..."
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/70"
                                                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                                                >
                                                    {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingApiKeys}
                                            className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSavingApiKeys ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Chaves de API'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-12"
                            >
                                <div>
                                    <h1 className="text-3xl font-bold mb-1 tracking-tight">Segurança da Conta</h1>
                                    <p className="text-white/50 text-sm">Atualize sua senha e gerencie o acesso à sua conta.</p>
                                </div>

                                <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-sm">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Nova Senha</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/30 text-sm"
                                            placeholder="Mínimo 6 caracteres"
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-white/70">Confirmar Nova Senha</label>
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <span className="text-xs text-red-400 font-medium">Não coincidem</span>
                                            )}
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full bg-[#111] border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-white/30 text-sm ${confirmPassword && newPassword !== confirmPassword
                                                    ? 'border-red-500/50 focus:ring-red-500/50'
                                                    : 'border-white/10 focus:ring-white/30'
                                                }`}
                                            placeholder="Digite a senha novamente"
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingPassword || !newPassword || newPassword !== confirmPassword}
                                            className="px-5 py-2.5 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 border border-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar Senha'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
