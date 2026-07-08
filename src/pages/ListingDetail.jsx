import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatBudget } from '../components/ListingCard'
import Avatar from '../components/Avatar'
import { PageSpinner } from '../App'
import { Mail, Clock, Repeat, ExternalLink } from 'lucide-react'
import { ReportButton } from '../components/reviews'
import { linkify, timeAgo } from '../lib/text'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [listing, setListing] = useState(undefined)
  const [owner, setOwner] = useState(null)
  const [contact, setContact] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: l } = await supabase.from('listings').select('*').eq('id', id).maybeSingle()
      setListing(l ?? null)
      if (l) {
        const { data: p } = await supabase.from('profiles').select('*').eq('user_id', l.owner_id).maybeSingle()
        setOwner(p ?? null)
      }
    }
    load()
  }, [id])

  async function revealContact() {
    setBusy(true); setError(null)
    const { data, error } = await supabase.rpc('reveal_contact', { p_listing_id: id })
    setBusy(false)
    if (error) setError(error.message)
    else setContact(data)
  }

  if (listing === undefined) return <PageSpinner />
  if (listing === null) {
    return <p className="py-24 text-center text-slate-500">This listing doesn’t exist or is no longer active.</p>
  }

  const isProject = listing.kind === 'project'
  const budget = formatBudget(listing)
  const isOwner = user?.id === listing.owner_id

  return (
    <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-[1fr_280px]">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isProject ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}>
            {isProject ? 'Project' : 'Talent'}
          </span>
          {listing.engagement && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              {listing.engagement === 'ongoing' ? <Repeat size={12} /> : <Clock size={12} />}
              {listing.engagement === 'ongoing' ? 'Ongoing' : 'One-time'}
            </span>
          )}
          {budget && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{budget}</span>}
          <span className="text-xs text-slate-400" title={new Date(listing.created_at).toLocaleString()}>
            Posted {timeAgo(listing.created_at)}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{listing.title}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-700">{linkify(listing.description)}</p>
        {(listing.skills || []).length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {listing.skills.map((s) => (
              <span key={s} className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">{s}</span>
            ))}
          </div>
        )}
      </article>

      <aside className="space-y-4">
        {owner && (
          <Link to={`/profile/${owner.user_id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <Avatar profile={owner} size={44} />
            <div className="min-w-0">
              <div className="truncate font-semibold">{owner.display_name}</div>
              <div className="text-xs text-slate-500">View profile</div>
            </div>
          </Link>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {contact ? (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</div>
              <p className="mt-1 break-words font-medium text-slate-900">{contact}</p>
              <p className="mt-2 text-xs text-slate-500">Reach out directly — Web Wrx isn’t part of your conversation or payment.</p>
            </div>
          ) : isOwner ? (
            <p className="text-sm text-slate-500">This is your ad.</p>
          ) : user ? (
            <>
              <button
                onClick={revealContact} disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Mail size={16} /> {busy ? 'One sec…' : 'Reveal contact'}
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">Free — no fees to connect.</p>
            </>
          ) : (
            <Link to="/login" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700">
              Sign in to see contact info
            </Link>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        {owner?.website_url && (
          <a
            href={owner.website_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-brand-600 shadow-sm hover:bg-slate-50"
          >
            Portfolio / website <ExternalLink size={14} />
          </a>
        )}

        {!isOwner && <div className="px-1"><ReportButton targetType="listing" targetId={id} /></div>}
      </aside>
    </div>
  )
}
