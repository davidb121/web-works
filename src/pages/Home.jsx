import { Link } from 'react-router-dom'
import BrowseListings from '../components/BrowseListings'
import { BadgePercent, ArrowRight } from 'lucide-react'
import { HeroIllustration, PostAdSpot, GetFoundSpot, ConnectSpot } from '../components/illustrations'

const HOW_IT_WORKS = [
  {
    Spot: PostAdSpot,
    title: 'Post your ad',
    body: 'Describe your project or your skills in a 3-step wizard. $5/month, cancel anytime.',
    to: '/post',
    cta: 'Post an ad',
  },
  {
    Spot: GetFoundSpot,
    title: 'Get found',
    body: 'Clients and freelancers browse and search — no algorithms deciding who sees you.',
    to: '/search',
    cta: 'Search listings',
  },
  {
    Spot: ConnectSpot,
    title: 'Connect directly',
    body: 'Reveal contact info and take it from there. Your terms, your payment, your client.',
    to: '/connect',
    cta: 'How it works',
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:mx-0">
            Web dev work, <span className="text-brand-600">without the middleman.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 lg:mx-0">
            Simple classifieds for websites and web apps. $5/month per ad, free accounts,
            direct contact. No commissions — you keep 100% of what you earn.
          </p>
          <div className="mt-6 flex justify-center gap-3 lg:justify-start">
            <Link to="/post" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow hover:bg-brand-700">
              Post an ad
            </Link>
            <a href="#browse" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100">
              Browse listings
            </a>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <BadgePercent size={16} /> Launch special: the first 100 project posts are just $2.
          </p>
        </div>
        <HeroIllustration className="mx-auto hidden w-full max-w-xl lg:block" />
      </section>

      {/* How it works */}
      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        {HOW_IT_WORKS.map(({ Spot, title, body, to, cta }) => (
          <Link
            key={title} to={to}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:border-brand-300 hover:shadow-md"
          >
            <Spot className="mx-auto h-20 w-20" />
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:underline">
              {cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      {/* Browse */}
      <section id="browse">
        <BrowseListings />
      </section>
    </div>
  )
}
