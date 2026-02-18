import { createClient } from "./supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getSubscriptionStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { isSubscribed: false, userId: null };
    }

    const { data: dbUser, error } = await supabaseAdmin
        .from('User')
        .select('isSubscribed')
        .eq('externalId', user.id)
        .single();

    if (error) {
        console.error('Error fetching subscription status:', error);
        return { isSubscribed: false, userId: user.id };
    }

    return {
        isSubscribed: dbUser?.isSubscribed ?? false,
        userId: user.id
    };
}
