import { NextResponse } from 'next/server';

/**
 * Supabase keepalive.
 *
 * Supabase pauses free-tier projects after 7 days without database activity.
 * A paused project breaks sign-in, favorites, and the dashboard.
 *
 * This route issues a trivial query so the project registers activity.
 * It is invoked daily by a Vercel Cron Job (see vercel.json) and can also
 * be hit manually at /api/keepalive to check status.
 *
 * Uses raw fetch rather than supabase-js to keep the failure surface small
 * and to surface the real network error when something goes wrong.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  // Env values are trimmed: a stray newline or space pasted into the Vercel
  // dashboard produces an invalid URL and an opaque "fetch failed".
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const url = rawUrl.trim().replace(/\/+$/, '');
  const key = rawKey.trim();

  const debug = new URL(request.url).searchParams.get('debug') === '1';

  if (!url || !key) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Supabase env vars not configured',
        hasUrl: Boolean(url),
        hasKey: Boolean(key),
      },
      { status: 500 }
    );
  }

  // Diagnostics that never reveal the key itself.
  const diagnostics = {
    urlHost: (() => {
      try {
        return new URL(url).host;
      } catch {
        return `INVALID_URL: ${JSON.stringify(url.slice(0, 60))}`;
      }
    })(),
    urlHadWhitespace: rawUrl !== rawUrl.trim(),
    keyHadWhitespace: rawKey !== rawKey.trim(),
    keyLength: key.length,
  };

  const startedAt = Date.now();

  try {
    const res = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    });

    const ms = Date.now() - startedAt;

    // 200 means the query ran. 401/403 mean RLS rejected it, but the request
    // still reached Postgres — which is what Supabase counts as activity.
    const awake = res.status === 200 || res.status === 401 || res.status === 403;

    return NextResponse.json(
      {
        ok: awake,
        awake,
        status: res.status,
        ms,
        ...(debug ? { diagnostics } : {}),
      },
      { status: awake ? 200 : 503 }
    );
  } catch (err) {
    const ms = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    const cause =
      err instanceof Error && err.cause
        ? String((err.cause as { message?: string })?.message ?? err.cause)
        : undefined;

    return NextResponse.json(
      {
        ok: false,
        awake: false,
        error: message,
        cause,
        ms,
        diagnostics, // always included on failure — this is what we need to debug
      },
      { status: 503 }
    );
  }
}
