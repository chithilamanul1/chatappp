import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

webpush.setVapidDetails(
    'mailto:test@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(req: Request) {
    try {
        const { userId, title, body } = await req.json();

        if (!userId || !title || !body) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
        }

        const payload = JSON.stringify({ title, body });

        const sendPromises = subscriptions.map((sub) =>
            webpush.sendNotification(sub.subscription, payload).catch((err) => {
                console.error('Error sending notification:', err);
            })
        );

        await Promise.all(sendPromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send push error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
