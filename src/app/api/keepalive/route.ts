import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase keepalive.
 *
 * Supabase pauses free-tier projects after 7 days without database activity.
 * A paused project breaks sign-in, favorites, and the dashboard.
 *
 * This route issues a trivial query so the project registers activity.
 * It is invoked daily by a Vercel Cron Job (see vercel.json) and can also
 * be hit manually at /api/keepalive to check status.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: 'Supabase env vars not configured' },
      { status: 500 }
    );
  }

  const startedAt = Date.now();

  try {
    const supabase = createClient(url, key);

    // Lightweight count query — touches the database without returning rows.
    // If RLS blocks anon access the request still reaches Postgres, which is
    // what Supabase counts as activity.
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const ms = Date.now() - startedAt;

    if (error) {
      // A permissions error still means the database responded.
      const blocked =
        error.code === 'PGRST301' ||
        error.message.toLowerCase().includes('permission') ||
        error.message.toLowerCase().includes('policy');

      if (blocked) {
        return NextResponse.json({
          ok: true,
          awake: true,
          note: 'Query blocked by RLS, but database responded',
          ms,
        });
      }

      return NextResponse.json(
        { ok: false, awake: false, error: error.message, ms },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, awake: true, ms });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        awake: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        ms: Date.now() - startedAt,
      },
      { status: 503 }
    );
  }
}
