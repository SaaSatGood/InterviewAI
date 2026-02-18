import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        console.log('Testing Supabase Admin connection...');

        // Try to fetch one user from the User table to test connection and permissions
        const { data, error } = await supabaseAdmin
            .from('User')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Supabase Admin Query Error:', error);
            return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Connection successful', data });
    } catch (err: any) {
        console.error('Supabase Admin Exception:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
