# Web Wrx — Phase 1

Classifieds for web development work. React + Vite + Tailwind, Supabase, Stripe, Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm run dev
```

## One-time setup

### 1. Supabase

1. Create a project at [database.new](https://database.new).
2. SQL Editor → paste and run `supabase/migrations/001_phase1_schema.sql`.
3. Settings → API → copy the Project URL and anon key into `.env.local`.

### 2. Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com) create an OAuth 2.0 Client ID (Web application).
   - Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
2. Supabase → Authentication → Providers → Google → paste client ID + secret, enable.
3. Authentication → URL Configuration → set Site URL to your Vercel domain (and `http://localhost:5173` in Additional Redirect URLs for dev).

### 3. Stripe

1. Create a product **"Web Wrx Listing"** with a recurring price of **$5.00/month** → copy the price ID.
2. Create a coupon: **$3.00 off, once** (makes the first month $2) → copy the coupon ID.
3. Enable the [customer portal](https://dashboard.stripe.com/settings/billing/portal) (for cancel/card management).
4. Set edge function secrets:

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_... \
  STRIPE_PRICE_ID=price_... \
  STRIPE_PROMO_COUPON_ID=... \
  SITE_URL=https://your-domain.vercel.app
```

5. Deploy the functions:

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```

6. Stripe Dashboard → Developers → Webhooks → add endpoint
   `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
   with events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`.
   Copy the signing secret and run `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`.

Use Stripe **test mode** keys until launch; card `4242 4242 4242 4242` works for test checkout.

### 4. GitHub + Vercel

```bash
git init && git add -A && git commit -m "Phase 1"
gh repo create web-works --private --source . --push   # or create the repo on github.com
```

Import the repo in [Vercel](https://vercel.com/new); set env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. `vercel.json` already handles SPA routing.

## How the money flows

Post-ad wizard → listing saved as `pending_payment` → `create-checkout` edge function creates a Stripe Checkout session ($5/mo, $2 first month auto-applied to the first 100 project posts) → Stripe webhook marks the listing `active` and stamps `expires_at`. Renewals extend it; cancellation lets it lapse at the paid-through date. The webhook is the only thing that activates listings — never the browser.

## Phase 2 (next)

Reviews with mutual confirmation + AI link verification, badges, report/moderation. See `../docs/implementation-plan.md`.
