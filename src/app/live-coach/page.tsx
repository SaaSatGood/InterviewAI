import { createClient } from '@/lib/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LiveCoachClient } from './LiveCoachClient';

export default async function LiveCoachPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Validates session, but lets the Client Component handle the specific blocking/paywall UI 
    // if the user is not subscribed. 
    // If absolutely no user, we could redirect, or let the component show the Login prompt.
    // Given the component has a "Login" state, we can render it even without user, 
    // or strictly redirect.
    // The previous logic redirected if !user. I will keep that for security if desired,
    // OR allow the "Sales Page" aspect of the component to show.
    // The previous code had: if (!user) redirect...
    // I will keep it to ensure we have a "user" context for the /live-coach route, 
    // assuming the main page is the landing.

    if (!user) {
        redirect('/?error=unauthorized');
    }

    return <LiveCoachClient />;
}
