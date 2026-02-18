import { createClient } from '@supabase/supabase-js';

// Fallback to placeholders to prevent build errors when env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase: Missing env variables using placeholders. This is safe for build, but might fail at runtime.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'pkce', // Ensure we use PKCE to get a 'code' in the callback
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
    }
});
