import { Link } from 'react-router-dom'
import { HeroIllustration } from '../components/illustrations'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">About Web Works</h1>

      <div className="prose-slate mt-6 space-y-4 text-slate-700">
        <p>
          Web Works is a classified-ad board for one thing only: websites and web apps.
          Freelancers post what they can build; clients post what they need built. You find
          each other, reveal contact info, and work together directly — off the platform,
          on your own terms.
        </p>
        <p className="font-semibold text-slate-900">Why it exists</p>
        <p>
          Hi — I'm{' '}
          <a href="https://www.linkedin.com/in/davidbeerman/" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
            Dave Beerman
          </a>
          , the developer who built and runs Web Works. I got tired of watching freelance
          platforms take 10–20% of every invoice while inserting themselves into every
          conversation, payment, and dispute. The big marketplaces have their place, but a
          lot of us just want what the classifieds section used to be: a cheap ad, a phone
          number, and a handshake. So I built it — solo, and I answer the support email myself.
        </p>
        <p className="font-semibold text-slate-900">The deal</p>
        <p>
          Accounts are free. A listing costs $5 a month — that's the whole business model.
          No commissions, no escrow, no fees on your invoices, no algorithm deciding who sees
          your ad. When you connect with someone here, the relationship is yours: your
          contract, your payment method, your client.
        </p>
        <p className="font-semibold text-slate-900">What we don't do</p>
        <p>
          We don't process payments between you and the people you work with, don't mediate
          disputes, and don't take a cut. That keeps prices at $5 and incentives honest — our
          only job is putting web-dev work and web-dev talent on the same page.
        </p>
        <p>
          Questions or feedback? We're small enough that a real person reads everything:{' '}
          <a href="mailto:support@web-wrx.net" className="text-brand-600 underline">support@web-wrx.net</a>.
        </p>
      </div>

      <div className="mt-10 flex gap-3">
        <Link to="/post" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow hover:bg-brand-700">
          Post an ad
        </Link>
        <Link to="/" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100">
          Browse listings
        </Link>
      </div>

      <HeroIllustration className="mx-auto mt-12 w-full max-w-lg" />
    </div>
  )
}
