import { Link } from 'react-router-dom'
import { ReviewBadge } from '../components/reviews'

function Q({ q, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold text-slate-900">{q}</h2>
      <div className="mt-2 space-y-2 text-slate-700">{children}</div>
    </div>
  )
}

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Pricing &amp; FAQ</h1>

      {/* Pricing, all in one place */}
      <div className="mt-8 rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-6 sm:p-8">
        <h2 className="text-lg font-bold">The whole price list</h2>
        <div className="mt-4 space-y-2 text-slate-700">
          <p className="flex justify-between gap-4"><span>Account (freelancer or client)</span><strong>Free</strong></p>
          <p className="flex justify-between gap-4"><span>Browsing, searching, revealing contacts</span><strong>Free</strong></p>
          <p className="flex justify-between gap-4"><span>Classified ad (project or talent)</span><strong>$5 / month</strong></p>
          <p className="flex justify-between gap-4 text-emerald-700"><span>Launch special — first month, first 200 project ads and first 200 developer ads</span><strong>$2</strong></p>
          <p className="flex justify-between gap-4"><span>Commission on work you win here</span><strong>$0, ever</strong></p>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Ads renew monthly until you cancel. No hidden tiers, no "featured" upsells, no cut of your invoices.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Q q="Can I edit my ad after posting?">
          <p>
            Yes — everything except its paid status. Go to My Listings → Edit; changes are live
            immediately, no re-approval and no extra charge.
          </p>
        </Q>

        <Q q="What happens when my ad expires?">
          <p>
            Ads renew automatically each month until you cancel (My Listings → Manage billing).
            After cancelling, your ad stays up through the period you've paid for, and we email you
            a week before it comes down. Expired ads simply stop being shown — nothing is deleted.
          </p>
        </Q>

        <Q q="What's the refund policy?">
          <p>
            Monthly listing fees are non-refundable except where the law requires — but cancelling
            always stops future charges, and at $5 the stakes are intentionally low. If something
            went genuinely wrong (double charge, ad never went live), email us and a human will fix it.
          </p>
        </Q>

        <Q q="How do the review badges work?">
          <p>
            Reviews can only be written after two accounts exchange contact info through the site,
            and they're ranked by how well-verified they are:
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <ReviewBadge badge="mutual_link" /> both parties confirmed the work happened <em>and</em> the
            reviewer linked the delivered site, which we automatically check is live and matches the description.
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <ReviewBadge badge="mutual" /> both parties confirmed, but the work isn't publicly linkable.
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <ReviewBadge badge="one_party" /> the other party didn't respond within 14 days.
          </p>
          <p>Ratings are weighted toward the stronger badges. Full detail on <Link to="/connect" className="text-brand-600 underline">how connecting works</Link>.</p>
        </Q>

        <Q q="How many people will see my ad?">
          <p>
            Honest answer: we're brand new, and we won't invent traffic numbers. That's exactly what
            the $2 launch pricing reflects — early posters take a small bet and lock in the cheapest
            slots while the audience grows. No commissions means an ad that lands you one client has
            paid for itself hundreds of times over.
          </p>
        </Q>

        <Q q="Who's behind this?">
          <p>
            One developer:{' '}
            <a href="https://www.linkedin.com/in/davidbeerman/" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
              Dave Beerman
            </a>
            . Read the whole story on the <Link to="/about" className="text-brand-600 underline">About page</Link>.
            Questions, problems, ideas:{' '}
            <a href="mailto:support@web-wrx.net" className="text-brand-600 underline">support@web-wrx.net</a>{' '}
            — a real person reads everything.
          </p>
        </Q>
      </div>

      <div className="mt-10 flex gap-3">
        <Link to="/post" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow hover:bg-brand-700">
          Post an ad
        </Link>
        <Link to="/search" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100">
          Browse listings
        </Link>
      </div>
    </div>
  )
}
