// Supabase Edge Function: create-checkout
// Creates a Stripe Checkout session for a listing's $5/mo subscription,
// applying the $2-first-month launch promo to any listing kind while slots last
// (200 slots per kind: project + talent).
// Also opens the Stripe Billing Portal when called with { portal: true }.
//
// Secrets required (supabase secrets set):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_PROMO_COUPON_ID, SITE_URL

import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const SITE_URL = Deno.env.get('SITE_URL')!

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    // Client bound to the caller's JWT (to identify the user)…
    const authed = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )
    const { data: { user } } = await authed.auth.getUser()
    if (!user) return json({ error: 'Not signed in' }, 401)

    // …and a service-role client for privileged writes.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body = await req.json()

    // Find or create the Stripe customer for this user.
    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .not('stripe_customer_id', 'is', null)
      .in(
        'listing_id',
        (await admin.from('listings').select('id').eq('owner_id', user.id)).data?.map((l) => l.id) ?? [],
      )
      .limit(1)
      .maybeSingle()

    let customerId = existingSub?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    // Billing portal
    if (body.portal) {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${SITE_URL}/my-listings`,
      })
      return json({ url: session.url })
    }

    // Checkout for a listing
    const { data: listing } = await admin
      .from('listings')
      .select('id, kind, owner_id, status, title')
      .eq('id', body.listing_id)
      .single()

    if (!listing || listing.owner_id !== user.id) return json({ error: 'Listing not found' }, 404)
    if (listing.status !== 'pending_payment') return json({ error: 'Listing is not awaiting payment' }, 400)

    // Try to claim a promo slot for this listing's kind (200 slots per kind).
    const { data: claimed } = await admin.rpc('claim_promo_slot', { p_kind: listing.kind })
    const promoApplied = claimed === true

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID')!, quantity: 1 }],
      ...(promoApplied ? { discounts: [{ coupon: Deno.env.get('STRIPE_PROMO_COUPON_ID')! }] } : {}),
      success_url: `${SITE_URL}/checkout/success`,
      cancel_url: `${SITE_URL}/checkout/canceled`,
      subscription_data: { metadata: { listing_id: listing.id } },
      metadata: { listing_id: listing.id, promo_applied: String(promoApplied) },
    })

    await admin.from('subscriptions').upsert({
      listing_id: listing.id,
      stripe_customer_id: customerId,
      status: 'checkout_started',
      promo_applied: promoApplied,
    })

    return json({ url: session.url })
  } catch (err) {
    console.error(err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
