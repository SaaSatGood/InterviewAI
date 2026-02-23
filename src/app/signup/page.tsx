'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { signInWithGoogle } = useAuth();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // 1. Create auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Optional: Set a default display name based on email prefix so user has some identifier
            const defaultName = email.split('@')[0] || '';
            await updateProfile(user, { displayName: defaultName });

            // 2. Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                displayName: defaultName,
                role: 'free',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });

            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Falha ao criar conta. Email pode já estar em uso.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err) {
            setError('Falha ao autenticar com o Google.');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Minimalist Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-sm mx-auto relative z-10"
            >
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-semibold text-white tracking-tight">
                        Comece agora.
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        Acesso imediato. Sem cartão de crédito.
                    </p>
                </div>

                <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-2xl">
                    <form className="space-y-4" onSubmit={handleSignup}>
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                <p className="text-xs text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 rounded-xl bg-[#111] border border-transparent text-white text-sm placeholder-neutral-500 focus:outline-none focus:bg-[#151515] focus:ring-1 focus:ring-white/20 transition-all font-medium"
                                placeholder="Endereço de email"
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                className="block w-full px-4 py-3 rounded-xl bg-[#111] border border-transparent text-white text-sm placeholder-neutral-500 focus:outline-none focus:bg-[#151515] focus:ring-1 focus:ring-white/20 transition-all font-medium"
                                placeholder="Crie uma senha (mín. 6 chars)"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3 px-4 rounded-xl flex items-center justify-center text-sm font-semibold text-black bg-white hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Criando conta...' : 'Criar conta'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/5" />
                            <span className="flex-shrink-0 mx-4 text-xs text-neutral-600 font-medium">Ou cadastrar com</span>
                            <div className="flex-grow border-t border-white/5" />
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={handleGoogleSignup}
                                className="w-full flex items-center justify-center px-4 py-3 border border-white/20 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Cadastrar com Google
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-neutral-500">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-white hover:underline transition-all">
                        Faça login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
