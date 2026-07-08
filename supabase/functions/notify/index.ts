// Supabase Edge Function: notify
// Drains the email_outbox and sends via Resend. Invoked by pg_cron (pg_net)
// every 5 minutes when pending rows exist. Auth: x-notify-secret header must
// match the NOTIFY_SECRET edge secret (deployed with verify_jwt=false).
//
// Secrets required: RESEND_API_KEY, NOTIFY_SECRET

import { createClient } from 'npm:@supabase/supabase-js@2'

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const SITE = 'https://www.web-wrx.net'
const FROM = 'Web Wrx <noreply@web-wrx.net>'

function layout(inner: string) {
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
  <div style="font-weight:800;font-size:18px;margin-bottom:16px">
    <span style="display:inline-block;background:#4f46e5;color:#fff;border-radius:8px;padding:2px 8px">W</span>
    Web Wrx
  </div>
  ${inner}
  <p style="color:#94a3b8;font-size:12px;margin-top:32px">
    Web Wrx — classifieds for web dev work. You're getting this because of activity on your account.
  </p>
</div>`
}

function render(template: string, p: Record<string, string>) {
  switch (template) {
    case 'review_request':
      return {
        subject: `Did you work with ${p.author_name}? Confirm to publish their review`,
        html: layout(`
          <p><strong>${p.author_name}</strong> left you a ${p.rating}-star review and says you worked together:</p>
          <blockquote style="border-left:3px solid #e2e8f0;margin:12px 0;padding:6px 12px;color:#475569">${p.body}</blockquote>
          <p>Confirming publishes it with a "Confirmed" badge. If you do nothing, it posts in 14 days marked one-party.</p>
          <p><a href="${SITE}/reviews" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Review and respond</a></p>`),
      }
    case 'review_live':
      return {
        subject: `Your review of ${p.subject_name} is live`,
        html: layout(`
          <p>Your review of <strong>${p.subject_name}</strong> is now public${p.badge === 'mutual_link' ? ' with the top badge: <strong>Confirmed · Link verified</strong> ✔' : p.badge === 'mutual' ? ' with a <strong>Confirmed</strong> badge' : ''}.</p>
          <p><a href="${SITE}/reviews" style="color:#4f46e5;font-weight:600">See your reviews</a></p>`),
      }
    case 'expiry_warning':
      return {
        subject: `Your ad "${p.title}" expires ${p.expires_on}`,
        html: layout(`
          <p>Your listing <strong>${p.title}</strong> isn't set to renew and will come down on <strong>${p.expires_on}</strong>.</p>
          <p>Want to keep it up? Restart the subscription from My Listings before it lapses.</p>
          <p><a href="${SITE}/my-listings" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Manage my listings</a></p>`),
      }
    case 'listing_expired':
      return {
        subject: `Your ad "${p.title}" has expired`,
        html: layout(`
          <p>Your listing <strong>${p.title}</strong> has reached the end of its paid period and is no longer shown.</p>
          <p>You can post it again any time — it takes about two minutes.</p>
          <p><a href="${SITE}/post" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Post an ad</a></p>`),
      }
    default:
      return null
  }
}

Deno.serve(async (req) => {
  if (req.headers.get('x-notify-secret') !== Deno.env.get('NOTIFY_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: batch } = await admin
    .from('email_outbox')
    .select('*')
    .eq('status', 'pending')
    .order('created_at')
    .limit(50)

  let sent = 0, failed = 0
  for (const msg of batch ?? []) {
    const rendered = render(msg.template, msg.payload ?? {})
    if (!rendered) {
      await admin.from('email_outbox').update({ status: 'error', error: 'unknown template' }).eq('id', msg.id)
      failed++
      continue
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to: msg.to_email, subject: rendered.subject, html: rendered.html }),
      })
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
      await admin.from('email_outbox')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', msg.id)
      sent++
    } catch (err) {
      await admin.from('email_outbox')
        .update({ status: 'error', error: String(err).slice(0, 500) })
        .eq('id', msg.id)
      failed++
    }
  }

  return new Response(JSON.stringify({ sent, failed }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
