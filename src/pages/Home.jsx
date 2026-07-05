import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import { PageSpinner } from '../App'
import { Search } from 'lucide-react'

export default function Home() {
  const [kind, setKind] = useState('project') // 'project' = find work is posted by clients; browse toggle
  const [query, setQuery] = useState('')
  const [listings, setListings] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setListings(null)
      let q = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('kind', kind)
        .order('created_at', { ascending: false })
        .limit(60)
      const { data, error } = await q
      if (!cancelled) setListings(error ? [] : data)
    }
    load()
    return () => { cancelled = true }
  }, [kind])

  const filtered = useMemo(() => {
    if (!listings) return null
    const t = query.trim().toLowerCase()
    if (!t) return listings
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(t) ||
        l.description.toLowerCase().includes(t) ||
        (l.skills || []).some((s) => s.toLowerCase().includes(t)),
    )
  }, [listings, query])

  return (
    <div>
      {/* Hero */}
      <section className="py-12 text-center sm:py-16">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Web dev work, <span className="text-brand-600">without the middleman.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Simple classifieds for websites and web apps. $5/month per ad, free accounts,
          direct contact. No commissions — you keep 100% of what you earn.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/post" className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow hover:bg-brand-700">
            Post an ad
          </Link>
          <a href="#browse" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100">
            Browse listings
          </a>
        </div>
        <p className="mt-4 text-sm font-medium text-emerald-700">
          🎉 Launch special: the first 100 project posts are just $2.
        </p>
      </section>

      {/* Browse */}
      <section id="browse">
        <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex self-center rounded-full bg-slate-200/70 p-1 sm:self-auto">
            <button
              onClick={() => setKind('project')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${kind === 'project' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Find work
            </button>
            <button
              onClick={() => setKind('talent')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${kind === 'talent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Find talent
            </button>
          </div>
          <div className="relative sm:w-80">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, skills…"
              className="w-full rounded-full border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        {filtered === null ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="font-medium text-slate-700">No {kind === 'project' ? 'projects' : 'talent ads'} yet.</p>
            <p className="mt-1 text-sm text-slate-500">Be the first — <Link to="/post" className="text-brand-600 underline">post an ad</Link>.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>
    </div>
  )
}
