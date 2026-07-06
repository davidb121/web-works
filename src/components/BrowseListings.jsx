import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, SKILL_OPTIONS } from '../lib/supabase'
import ListingCard from './ListingCard'
import { PageSpinner } from '../App'
import { Search } from 'lucide-react'

/** Browse/search UI shared by the home page and the /search page. */
export default function BrowseListings({ showSkillFilter = false }) {
  const [kind, setKind] = useState('project')
  const [query, setQuery] = useState('')
  const [skillFilter, setSkillFilter] = useState([])
  const [listings, setListings] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setListings(null)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('kind', kind)
        .order('created_at', { ascending: false })
        .limit(60)
      if (!cancelled) setListings(error ? [] : data)
    }
    load()
    return () => { cancelled = true }
  }, [kind])

  const filtered = useMemo(() => {
    if (!listings) return null
    const t = query.trim().toLowerCase()
    return listings.filter((l) => {
      const textOk =
        !t ||
        l.title.toLowerCase().includes(t) ||
        l.description.toLowerCase().includes(t) ||
        (l.skills || []).some((s) => s.toLowerCase().includes(t))
      const skillsOk = skillFilter.every((s) => (l.skills || []).includes(s))
      return textOk && skillsOk
    })
  }, [listings, query, skillFilter])

  function toggleSkillFilter(s) {
    setSkillFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  return (
    <div>
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

      {showSkillFilter && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {SKILL_OPTIONS.map((s) => (
            <button
              key={s} type="button" onClick={() => toggleSkillFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${skillFilter.includes(s) ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-300 hover:ring-slate-400'}`}
            >
              {s}
            </button>
          ))}
          {skillFilter.length > 0 && (
            <button onClick={() => setSkillFilter([])} className="px-2 text-xs font-medium text-brand-600 hover:underline">
              Clear
            </button>
          )}
        </div>
      )}

      {filtered === null ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-medium text-slate-700">No {kind === 'project' ? 'projects' : 'talent ads'} found.</p>
          <p className="mt-1 text-sm text-slate-500">Be the first — <Link to="/post" className="text-brand-600 underline">post an ad</Link>.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}
