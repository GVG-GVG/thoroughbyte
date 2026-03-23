import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Fire welcome email (non-blocking — don't delay redirect)
      fireWelcomeEmail(origin, data.user.id).catch((err) =>
        console.error('Welcome email trigger failed:', err),
      );

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code exchange failed — redirect to sign-in with error
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`);
}

async function fireWelcomeEmail(origin: string, userId: string) {
  await fetch(`${origin}/api/send-welcome`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
    },
    body: JSON.stringify({ userId }),
  });
}
