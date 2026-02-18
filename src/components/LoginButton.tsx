'use client';

import { createClient } from "@/lib/utils/supabase/client";
import { FcGoogle } from 'react-icons/fc';
import { useState } from "react";

export function LoginButton() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleLogin = async () => {
        setIsLoading(true);
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/live-coach`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    return (
        <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-white text-black font-semibold rounded-xl border border-white/20 hover:bg-neutral-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50"
        >
            <FcGoogle className="w-6 h-6" />
            <span>{isLoading ? 'Entrando...' : 'Entrar com Google'}</span>
        </button>
    );
}
