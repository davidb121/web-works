import { Link } from 'react-router-dom'

const EFFECTIVE_DATE = 'July 5, 2026'

function Section({ n, title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{n}. {title}</h2>
      <div className="mt-2 space-y-3 text-slate-700">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Effective {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-slate-700">
        This policy explains what Web Works (web-wrx.net) collects, why, and what we do with it.
        The short version: we collect what's needed to run a classifieds site and nothing more.
        We don't sell your data, we don't run advertising, and we don't track you around the web.
      </p>

      <Section n={1} title="What we collect">
        <p>
          <strong>Account data:</strong> your email address and, if you sign in with Google, the
          name and profile photo Google shares with us.
        </p>
        <p>
          <strong>Profile and listing content:</strong> whatever you choose to put in your profile
          (display name, bio, photo or logo, links) and your listings. Note that active listings
          and profiles are public by design — that's the point of a classified ad.
        </p>
        <p>
          <strong>Contact exchanges:</strong> when you reveal contact info on a listing, we log
          which two accounts connected and when. This is what makes verified reviews possible.
        </p>
        <p>
          <strong>Payment data:</strong> payments are processed by Stripe. We never see or store
          your card number — we keep only your Stripe customer ID and subscription status.
        </p>
        <p>
          <strong>Technical logs:</strong> our hosting providers (Vercel, Supabase) keep standard
          server logs (IP address, browser type, pages requested) for security and debugging.
        </p>
      </Section>

      <Section n={2} title="What we use it for">
        <p>
          Operating the Service: showing your listings, processing your subscription, enabling
          contact between users, verifying reviews, preventing spam and fraud, and emailing you
          about your account (confirmations, expiry notices). We don't send marketing email unless
          you opt in, and we don't sell or rent personal data to anyone.
        </p>
      </Section>

      <Section n={3} title="Who we share it with">
        <p>
          Only service providers that make the site work: <strong>Supabase</strong> (database,
          authentication, file storage), <strong>Stripe</strong> (payments),{' '}
          <strong>Vercel</strong> (hosting), and <strong>Google</strong> (if you choose Google
          sign-in). Each processes data under its own privacy policy. Beyond that, we disclose
          data only if required by law or to protect the Service and its users.
        </p>
      </Section>

      <Section n={4} title="What other users see">
        <p>
          Your public profile and active listings are visible to anyone, including logged-out
          visitors and search engines. Your contact details are shown only to signed-in users who
          click "Reveal contact" on your listing. Think of anything you post as public.
        </p>
      </Section>

      <Section n={5} title="Retention and deletion">
        <p>
          We keep your data while your account is active. If you close your account, we delete
          your profile and listings; we may retain payment records (required for tax and
          accounting), logs, and records needed to prevent fraud or enforce our Terms. To request
          deletion, email{' '}
          <a href="mailto:support@web-wrx.net" className="text-brand-600 underline">support@web-wrx.net</a>.
        </p>
      </Section>

      <Section n={6} title="Your rights">
        <p>
          You can access and update your profile and listings at any time from your account. You
          may request a copy of your data, or its correction or deletion, by emailing us.
          Depending on where you live (e.g., the EU/UK under GDPR or California under the CCPA),
          you may have additional statutory rights; we honor valid requests regardless of where
          you're located.
        </p>
      </Section>

      <Section n={7} title="Children">
        <p>
          Web Works is for adults. We don't knowingly collect data from anyone under 18; if we
          learn we have, we'll delete it.
        </p>
      </Section>

      <Section n={8} title="Changes and contact">
        <p>
          If we make material changes to this policy, we'll announce them on the site or by email.
          Questions:{' '}
          <a href="mailto:support@web-wrx.net" className="text-brand-600 underline">support@web-wrx.net</a>.
          See also our <Link to="/cookies" className="text-brand-600 underline">Cookie Policy</Link>{' '}
          and <Link to="/terms" className="text-brand-600 underline">Terms of Use</Link>.
        </p>
      </Section>
    </div>
  )
}
