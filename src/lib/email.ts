import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const PLAN_DISPLAY: Record<string, string> = {
  shortlist: 'Short List',
  pro: 'Pro',
  elite: 'Elite',
};

const PLAN_FEATURES: Record<string, string[]> = {
  shortlist: [
    '25 horse cards for your selected sale',
    'Full scouting report on every card',
    'Score, tier, rank, and value flags',
  ],
  pro: [
    'Unlimited horse cards across all sales',
    'Current + historical sale data',
    'Consigner performance ratings',
    'Full scouting reports with score breakdowns',
  ],
  elite: [
    'Everything in Pro, plus:',
    'Full ranked list &mdash; sort and filter the entire sale',
    'Sire performance analytics',
    'Value flags and market miss alerts',
    'PDF export for offline scouting',
  ],
};

function emailHeader(): string {
  return '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;font-family:\'Inter\',-apple-system,BlinkMacSystemFont,sans-serif"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #dfe4ea;overflow:hidden">' +
    '<tr><td style="background:#1a2332;padding:28px 32px;text-align:center"><table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto" role="presentation"><tr><td style="width:36px;height:36px;border-radius:50%;-webkit-border-radius:50%;border:2px solid #c8963e;text-align:center;vertical-align:middle;font-size:14px;font-weight:800;font-family:Arial,Helvetica,sans-serif;line-height:36px;color:#ffffff;letter-spacing:-0.5px">T<span style="color:#c8963e">B</span></td><td style="padding-left:10px;vertical-align:middle"><span style="font-size:22px;color:#ffffff;font-weight:300;font-family:Arial,Helvetica,sans-serif">Thorough</span><span style="font-size:22px;color:#c8963e;font-weight:700;font-family:Arial,Helvetica,sans-serif">Byte</span></td></tr></table></td></tr>';
}

function emailFooter(): string {
  return '<tr><td style="padding:20px 32px;border-top:1px solid #dfe4ea;text-align:center">' +
    '<p style="font-size:12px;color:#8a9bae;margin:0">&copy; 2026 ThoroughByte. Breeze Intelligence.</p>' +
    '</td></tr></table></td></tr></table>';
}

export function buildUpgradeHtml(name: string, plan: string, saleId?: string): string {
  const firstName = name?.split(' ')[0] || 'there';
  const planName = PLAN_DISPLAY[plan] || plan;
  const features = PLAN_FEATURES[plan] || [];

  let featuresHtml = '';
  for (const f of features) {
    featuresHtml += `<tr><td style="padding:4px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#c8963e;margin-right:10px;vertical-align:middle"></span><span style="font-size:14px;color:#5a6a7e">${f}</span></td></tr>`;
  }

  let saleNote = '';
  if (plan === 'shortlist' && saleId) {
    saleNote = `<p style="font-size:14px;color:#5a6a7e;line-height:1.6;margin:0 0 20px">Your 25 credits are loaded for <strong style="color:#1a2332">${saleId.replace(/-/g, ' ').toUpperCase()}</strong>. Start scouting your short list now.</p>`;
  }

  let unlimitedNote = '';
  if (plan === 'pro' || plan === 'elite') {
    unlimitedNote = '<p style="font-size:14px;color:#5a6a7e;line-height:1.6;margin:0 0 20px">You now have <strong style="color:#1a2332">unlimited horse card generation</strong>. No credits to track &mdash; just search and generate.</p>';
  }

  return emailHeader() +
    `<tr><td style="padding:36px 32px 28px">` +
    `<h1 style="font-size:24px;color:#1a2332;margin:0 0 6px;font-weight:700">You're on ${planName}, ${firstName}</h1>` +
    `<p style="font-size:13px;color:#c8963e;font-weight:600;letter-spacing:1px;margin:0 0 20px">PLAN UPGRADE CONFIRMED</p>` +
    `<p style="font-size:15px;color:#5a6a7e;line-height:1.6;margin:0 0 20px">Your upgrade to <strong style="color:#1a2332">${planName}</strong> is active immediately. Here's what you've unlocked:</p>` +
    unlimitedNote + saleNote +
    `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;border-radius:6px;margin-bottom:24px"><tr><td style="padding:20px 24px">` +
    `<p style="font-size:14px;font-weight:700;color:#1a2332;margin:0 0 12px">${planName} Includes</p>` +
    `<table width="100%" cellpadding="0" cellspacing="0">${featuresHtml}</table>` +
    `</td></tr></table>` +
    `<p style="margin:0 0 24px;text-align:center"><a href="https://thoroughbyte.com/dashboard" style="display:inline-block;background:#c8963e;color:#ffffff;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none">Go to Your Dashboard</a></p>` +
    `<p style="font-size:13px;color:#8a9bae;line-height:1.5;margin:0">A payment receipt from Stripe has been sent separately. If you have any questions, reply to this email or contact us at <a href="mailto:info@thoroughbyte.com" style="color:#c8963e;text-decoration:none">info@thoroughbyte.com</a>.</p>` +
    `</td></tr>` +
    emailFooter();
}

export function buildCancellationHtml(name: string, plan: string): string {
  const firstName = name?.split(' ')[0] || 'there';
  const planName = PLAN_DISPLAY[plan] || plan;

  return emailHeader() +
    '<tr><td style="padding:36px 32px 28px">' +
    `<h1 style="font-size:24px;color:#1a2332;margin:0 0 6px;font-weight:700">Your ${planName} plan has ended</h1>` +
    '<p style="font-size:13px;color:#8a9bae;font-weight:600;letter-spacing:1px;margin:0 0 20px">SUBSCRIPTION CANCELED</p>' +
    `<p style="font-size:15px;color:#5a6a7e;line-height:1.6;margin:0 0 20px">Hey ${firstName}, your <strong style="color:#1a2332">${planName}</strong> subscription has been canceled and your account has been moved to the Free tier.</p>` +
    '<p style="font-size:15px;color:#5a6a7e;line-height:1.6;margin:0 0 20px">You still have access to your 3 free horse cards. If you\'d like to reactivate at any time, you can upgrade again from your dashboard.</p>' +
    '<p style="margin:0 0 24px;text-align:center"><a href="https://thoroughbyte.com/dashboard" style="display:inline-block;background:#c8963e;color:#ffffff;padding:14px 40px;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none">Go to Your Dashboard</a></p>' +
    '<p style="font-size:13px;color:#8a9bae;line-height:1.5;margin:0">If this was a mistake or you have questions, reply to this email or contact us at <a href="mailto:info@thoroughbyte.com" style="color:#c8963e;text-decoration:none">info@thoroughbyte.com</a>.</p>' +
    '</td></tr>' +
    emailFooter();
}

export async function sendCancellationEmail(
  email: string,
  name: string,
  plan: string,
): Promise<{ id?: string; error?: string }> {
  const planName = PLAN_DISPLAY[plan] || plan;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'ThoroughByte <noreply@thoroughbyte.com>',
      to: email,
      subject: `Your ${planName} subscription has been canceled — ThoroughByte`,
      html: buildCancellationHtml(name, plan),
    });

    if (error) {
      console.error('Cancellation email send error:', error);
      return { error: error.message };
    }

    console.log(`Cancellation email sent to ${email} (resend: ${data?.id})`);
    return { id: data?.id };
  } catch (err) {
    console.error('Cancellation email failed:', err);
    return { error: 'Send failed' };
  }
}

export async function sendUpgradeEmail(
  email: string,
  name: string,
  plan: string,
  saleId?: string,
): Promise<{ id?: string; error?: string }> {
  const planName = PLAN_DISPLAY[plan] || plan;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'ThoroughByte <noreply@thoroughbyte.com>',
      to: email,
      subject: `You've upgraded to ${planName} — ThoroughByte`,
      html: buildUpgradeHtml(name, plan, saleId),
    });

    if (error) {
      console.error('Upgrade email send error:', error);
      return { error: error.message };
    }

    console.log(`Upgrade email sent to ${email} for ${plan} (resend: ${data?.id})`);
    return { id: data?.id };
  } catch (err) {
    console.error('Upgrade email failed:', err);
    return { error: 'Send failed' };
  }
}
