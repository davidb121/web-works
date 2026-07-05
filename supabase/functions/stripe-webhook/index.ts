// Supabase Edge Function: stripe-webhook
// Single source of truth for listing paid status.
// Configure the endpoint in Stripe Dashboard → Webhooks with events:
//   checkout.session.completed, invoice.paid, customer.subscription.deleted, customer.subscription.updated
//
// Secrets required: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// Deploy with --no-verify-jwt (Stripe can't send a Supabase JWT).

import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('No signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    console.error('Signature verification failed', err)
    return new Response('Bad signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const listingId = session.metadata?.listing_id
        if (listingId && session.subscription) {
          await activateListing(listingId, session.subscription as string, session.customer as string)
        }
        break
      }
      case 'invoice.paid': {
        // Renewals: extend the listing period.
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string | null
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          const listingId = sub.metadata?.listing_id
          if (listingId) {
            await admin.from('listings')
              .update({ status: 'active', expires_at: new Date(sub.current_period_end * 1000).toISOString() })
              .eq('id', listingId)
            await admin.from('subscriptions')
              .update({ status: sub.status, updated_at: new Date().toISOString() })
              .eq('listing_id', listingId)
          }
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const listingId = sub.metadata?.listing_id
        if (listingId) {
          await admin.from('subscriptions')
            .update({ status: sub.status, updated_at: new Date().toISOString() })
            .eq('listing_id', listingId)
          if (sub.status === 'canceled' || sub.status === 'unpaid' || sub.status === 'incomplete_expired') {
            // Let the listing run out at its paid-through date; expire immediately if past it.
            const paidThrough = new Date(sub.current_period_end * 1000)
            if (paidThrough <= new Date()) {
              await admin.from('listings').update({ status: 'expired' }).eq('id', listingId)
            }
          }
        }
        break
      }
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('Handler error', { status: 500 })
  }
})

async function activateListing(listingId: string, subscriptionId: string, customerId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  await admin.from('listings')
    .update({ status: 'active', expires_at: new Date(sub.current_period_end * 1000).toISOString() })
    .eq('id', listingId)
  await admin.from('subscriptions').upsert({
    listing_id: listingId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    status: sub.status,
    updated_at: new Date().toISOString(),
  })
}
