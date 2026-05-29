import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key to bypass RLS policies for deletion
);

export async function GET(request: Request) {
  // Check authorization header to secure the cron endpoint
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // 1. Delete rows from DB
  const { data: expiredMessages } = await supabase
    .from('messages')
    .delete()
    .lt('created_at', twoHoursAgo)
    .select();

  // 2. Optional: Extract media URLs from expiredMessages and delete files from Supabase Storage bucket if needed.

  return NextResponse.json({ success: true, deletedCount: expiredMessages?.length || 0 });
}
