import { Link } from 'react-router-dom'
import { Briefcase, Wrench, Clock, Repeat } from 'lucide-react'

export function formatBudget(l) {
  if (!l.budget_min && !l.budget_max) return null
  const fmt = (n) => `$${Number(n).toLocaleString()}`
  if (l.budget_min && l.budget_max) return `${fmt(l.budget_min)}–${fmt(l.budget_max)}`
  return fmt(l.budget_min || l.budget_max)
}

export default function ListingCard({ listing }) {
  const isProject = listing.kind === 'project'
  const budget = formatBudget(listing)
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isProject ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'
          }`}
        >
          {isProject ? <Briefcase size={12} /> : <Wrench size={12} />}
          {isProject ? 'Project' : 'Talent'}
        </span>
        {listing.engagement && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            {listing.engagement === 'ongoing' ? <Repeat size={12} /> : <Clock size={12} />}
            {listing.engagement === 'ongoing' ? 'Ongoing' : 'One-time'}
          </span>
        )}
      </div>
      <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-brand-700">{listing.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-600">{listing.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {budget && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{budget}</span>}
        {(listing.skills || []).slice(0, 4).map((s) => (
          <span key={s} className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">{s}</span>
        ))}
      </div>
    </Link>
  )
}
