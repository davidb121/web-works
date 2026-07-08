// My reviews: confirm/deny reviews about me, track reviews I wrote.
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import { Stars, ReviewBadge } from '../components/reviews'
import { PageSpinner } from '../App'

const STATUS_LABEL = {
  pending_confirmation: ['Awaiting their confirmation', 'bg-amber-50 text-amber-700'],
  pending_verification: ['Verifying work link…', 'bg-sky-50 text-sky-700'],
  live: ['Live', 'bg-emerald-50 text-emerald-700'],
  rejected: ['Not confirmed', 'bg-slate-100 text-slate-500'],
}

export default function Reviews() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [inbox, setInbox] = useState(null)   // reviews about me awaiting confirmation
  const [written, setWritten] = useState(null) // reviews I authored
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [loading, user, navigate])

  async function load() {
    const [{ data: inb }, { data: wr }] = await Promise.all([
      supabase
        .from('reviews')
        .select('*, author:profiles!reviews_author_id_fkey(user_id, display_name, avatar_url, company_logo_url)')
        .eq('subject_id', user.id)
        .eq('status', 'pending_confirmation')
        .order('created_at', { ascending: false }),
      supabase
        .from('reviews')
        .select('*, subject:profiles!reviews_subject_id_fkey(user_id, display_name, avatar_url, company_logo_url)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false }),
    ])
    setInbox(inb ?? [])
    setWritten(wr ?? [])
  }

  useEffect(() => { if (user) load() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function respond(review, confirm) {
    setBusyId(review.id); setError(null)
    const { data, error } = await supabase.rpc('respond_to_review', {
      p_review_id: review.id,
      p_confirm: confirm,
    })
    if (error) {
      setError(error.message)
    } else if (data === 'pending_verification') {
      // Kick off the link check; fire-and-forget.
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ review_id: review.id }),
      }).catch(() => {})
    }
    setBusyId(null)
    load()
  }

  if (loading || inbox === null) return <PageSpinner />

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <h1 className="text-3xl font-bold">Reviews</h1>

      <h2 className="mt-8 text-lg font-bold">Waiting on you</h2>
      <p className="mt-1 text-sm text-slate-500">
        Someone says you worked together. Confirming publishes their review with a
        "Confirmed" badge; if you do nothing for 14 days it posts as one-party.
      </p>
      {inbox.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Nothing waiting. 🎉
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {inbox.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2.5">
                <Avatar profile={r.author} size={32} />
                <Link to={`/profile/${r.author?.user_id}`} className="text-sm font-semibold hover:underline">
                  {r.author?.display_name}
                </Link>
                <Stars value={r.rating} />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{r.body}</p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => respond(r, true)} disabled={busyId === r.id}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Yes, we worked together
                </button>
                <button
                  onClick={() => respond(r, false)} disabled={busyId === r.id}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  No, we didn't
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <h2 className="mt-10 text-lg font-bold">Reviews you wrote</h2>
      {written?.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          None yet. Visit the profile of someone you've worked with to leave one.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {written.map((r) => {
            const [label, cls] = STATUS_LABEL[r.status] ?? []
            return (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Avatar profile={r.subject} size={28} />
                  <Link to={`/profile/${r.subject?.user_id}`} className="text-sm font-semibold hover:underline">
                    {r.subject?.display_name}
                  </Link>
                  <Stars value={r.rating} />
                  {label && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>}
                  <ReviewBadge badge={r.badge} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{r.body}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
