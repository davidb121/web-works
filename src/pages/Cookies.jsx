import { Link } from 'react-router-dom'

const EFFECTIVE_DATE = 'July 5, 2026'

export default function Cookies() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cookie Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Effective {EFFECTIVE_DATE}</p>

      <div className="mt-6 space-y-4 text-slate-700">
        <p>
          Web Wrx uses as little in the way of cookies and browser storage as we can get away
          with. We use <strong>no advertising cookies, no cross-site trackers, and no social
          media pixels</strong> — which is why you don't see a cookie consent banner here.
        </p>

        <h2 className="pt-4 text-lg font-bold text-slate-900">What we actually use</h2>
        <p>
          <strong>Sign-in session (essential):</strong> when you sign in, Supabase (our
          authentication provider) stores a session token in your browser's local storage so you
          stay logged in between visits. It identifies your session to us and nobody else, and
          it's removed when you sign out.
        </p>
        <p>
          <strong>Stripe (essential, during checkout):</strong> when you pay for a listing you're
          taken to Stripe's checkout pages, where Stripe sets its own cookies for payment
          processing and fraud prevention. These are governed by{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer" className="text-brand-600 underline">Stripe's privacy policy</a>.
        </p>
        <p>
          <strong>Google (essential, during sign-in):</strong> if you use "Sign in with Google,"
          Google sets its own cookies on its own pages as part of the sign-in flow, governed by{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-brand-600 underline">Google's privacy policy</a>.
        </p>

        <h2 className="pt-4 text-lg font-bold text-slate-900">What we don't use</h2>
        <p>
          No third-party advertising networks, no behavioral tracking, no fingerprinting, no
          analytics cookies. If we add analytics later, we'll use a cookieless, privacy-respecting
          service and update this page first.
        </p>

        <h2 className="pt-4 text-lg font-bold text-slate-900">Managing cookies</h2>
        <p>
          You can clear local storage and cookies through your browser settings at any time — the
          only effect on Web Wrx is that you'll be signed out. Blocking essential storage
          entirely may prevent sign-in from working.
        </p>

        <p className="pt-4">
          Questions:{' '}
          <a href="mailto:support@web-wrx.net" className="text-brand-600 underline">support@web-wrx.net</a>.
          See also our <Link to="/privacy" className="text-brand-600 underline">Privacy Policy</Link>{' '}
          and <Link to="/terms" className="text-brand-600 underline">Terms of Use</Link>.
        </p>
      </div>
    </div>
  )
}
