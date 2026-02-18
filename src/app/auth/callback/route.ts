import { createClient } from '@/lib/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/live-coach'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                try {
                    // Sync user to publicSchema
                    const { error: upsertError } = await supabaseAdmin
                        .from('User')
                        .upsert({
                            externalId: user.id,
                            email: user.email!,
                            name: user.user_metadata.full_name || user.email?.split('@')[0],
                            imageUrl: user.user_metadata.avatar_url,
                            updatedAt: new Date().toISOString(),
                        }, { onConflict: 'externalId' });

                    if (upsertError) {
                        console.error('Error syncing user to public schema:', upsertError);
                        // Do not block login, just log error
                    } else {
                        console.log('User synced to public schema:', user.id);
                    }
                } catch (err) {
                    console.error('Exception syncing user:', err);
                }
            }

            console.log('Auth success, redirecting to:', next);
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('Auth error during code exchange:', error);
        }
    } else {
        console.error('No code found in search params');
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
