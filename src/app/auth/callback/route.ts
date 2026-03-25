import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Send welcome email inline (no internal HTTP round-trip)
      sendWelcomeIfNeeded(data.user.id).catch((err) =>
        console.error('Welcome email failed:', err),
      );

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`);
}

async function sendWelcomeIfNeeded(userId: string) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name, welcome_email_sent')
    .eq('id', userId)
    .single();

  if (!profile || profile.welcome_email_sent) return;

  const firstName = profile.full_name?.split(' ')[0] || 'there';

  // Fetch the welcome guide PDF
  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/ThoroughByte_Welcome_Guide.pdf`;
  const pdfResp = await fetch(pdfUrl);
  const pdfBuffer = Buffer.from(await pdfResp.arrayBuffer());

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: 'ThoroughByte <noreply@thoroughbyte.com>',
    to: profile.email,
    subject: 'Welcome to ThoroughByte — Your Account Is Ready',
    html: buildWelcomeHtml(firstName),
    attachments: [
      { filename: 'ThoroughByte_Welcome_Guide.pdf', content: pdfBuffer },
    ],
  });

  if (error) {
    console.error('Resend welcome error:', error);
    return;
  }

  await supabaseAdmin
    .from('profiles')
    .update({ welcome_email_sent: true, updated_at: new Date().toISOString() })
    .eq('id', userId);

  console.log(`Welcome email sent to ${profile.email}`);
}

function buildWelcomeHtml(firstName: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #dfe4ea;overflow:hidden">
<tr><td style="background:#1a2332;padding:28px 32px;text-align:center"><table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto" role="presentation"><tr><td style="width:36px;height:36px;border-radius:50%;-webkit-border-radius:50%;border:2px solid #c8963e;text-align:center;vertical-align:middle;font-size:14px;font-weight:800;font-family:Arial,Helvetica,sans-serif;line-height:36px;color:#ffffff;letter-spacing:-0.5px">T<span style="color:#c8963e">B</span></td><td style="padding-left:10px;vertical-align:middle"><span style="font-size:22px;color:#ffffff;font-weight:300;font-family:Arial,Helvetica,sans-serif">Thorough</span><span style="font-size:22px;color:#c8963e;font-weight:700;font-family:Arial,Helvetica,sans-serif">Byte</span></td></tr></table></td></tr>
<tr><td style="padding:36px 32px 28px">
<h1 style="font-size:24px;color:#1a2332;margin:0 0 6px;font-weight:700">Welcome to Thorough<span style="color:#c8963e">Byte</span>, ${firstName}</h1>
<p style="font-size:13px;color:#c8963e;font-weight:600;letter-spacing:1px;margin:0 0 20px">BREEZE INTELLIGENCE</p>
<p style="font-size:15px;color:#5a6a7e;line-height:1.6;margin:0 0 20px">You're in. Your account is active and you have <strong style="color:#1a2332">3 free hip lookups</strong> ready to use.</p>
<p style="font-size:15px;color:#5a6a7e;line-height:1.6;margin:0 0 24px">ThoroughByte scores every two-year-old that breezes at OBS sales using a proprietary algorithm that evaluates time, stride efficiency, acceleration, and deceleration &mdash; normalized for distance, sex, and session conditions. The result: an objective, apples-to-apples comparison across the entire sale.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;border-radius:6px;margin-bottom:24px"><tr><td style="padding:20px 24px">
<p style="font-size:14px;font-weight:700;color:#1a2332;margin:0 0 12px">Get Started in 3 Steps</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:4px 0"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#c8963e;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;margin-right:10px">1</span><span style="font-size:14px;color:#5a6a7e">Sign in at <a href="https://thoroughbyte.com" style="color:#c8963e;font-weight:600;text-decoration:none">thoroughbyte.com</a></span></td></tr>
<tr><td style="padding:4px 0"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#c8963e;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;margin-right:10px">2</span><span style="font-size:14px;color:#5a6a7e">Select a sale and search by hip number</span></td></tr>
<tr><td style="padding:4px 0"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#c8963e;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;margin-right:10px">3</span><span style="font-size:14px;color:#5a6a7e">Generate your horse card &mdash; score, tier, rank, and full scouting report</span></td></tr>
</table>
</td></tr></table>
<p style="margin:0 0 24px;text-align:center"><a href="https://thoroughbyte.com/dashboard" style="display:inline-block;background:#c8963e;color:#ffffff;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none">Go to Your Dashboard</a></p>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #dfe4ea;margin-top:4px"><tr><td style="padding:20px 0 0">
<p style="font-size:14px;font-weight:700;color:#1a2332;margin:0 0 12px">Need more than 3 lookups?</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
<tr>
<td style="padding:8px 0;vertical-align:top;width:100px"><strong style="color:#1a2332;font-size:13px">Short List</strong><br/><span style="font-size:12px;color:#c8963e;font-weight:600">$250/sale</span></td>
<td style="padding:8px 0;font-size:13px;color:#5a6a7e;line-height:1.5">25 horse cards for a single sale. Scout your short list before the ring opens.</td>
</tr>
<tr><td colspan="2" style="border-bottom:1px solid #f0f2f5;padding:0;height:1px"></td></tr>
<tr>
<td style="padding:8px 0;vertical-align:top;width:100px"><strong style="color:#1a2332;font-size:13px">Pro</strong><br/><span style="font-size:12px;color:#c8963e;font-weight:600">$1,000/yr</span></td>
<td style="padding:8px 0;font-size:13px;color:#5a6a7e;line-height:1.5">Unlimited cards, all sales (current + historical), plus consigner ratings.</td>
</tr>
<tr><td colspan="2" style="border-bottom:1px solid #f0f2f5;padding:0;height:1px"></td></tr>
<tr>
<td style="padding:8px 0;vertical-align:top;width:100px"><strong style="color:#1a2332;font-size:13px">Elite</strong><br/><span style="font-size:12px;color:#c8963e;font-weight:600">$5,000/yr</span></td>
<td style="padding:8px 0;font-size:13px;color:#5a6a7e;line-height:1.5">Everything in Pro, plus full ranked list, sire performance, value flags, sorting, filtering, and PDF export.</td>
</tr>
</table>
<p style="margin:0"><a href="https://thoroughbyte.com/#pricing" style="color:#c8963e;font-size:14px;font-weight:600;text-decoration:none">Compare all plans &rarr;</a></p>
</td></tr></table>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #dfe4ea;text-align:center">
<p style="font-size:12px;color:#8a9bae;margin:0">&copy; 2026 ThoroughByte. Breeze Intelligence.</p>
</td></tr>
</table></td></tr></table>`;
}
