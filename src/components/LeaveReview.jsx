// "Leave a review" box shown on a profile when the viewer is eligible:
// a contact exchange must link the two accounts, and no prior review exists
// for that pair+listing.
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Stars } from './reviews'

export default function LeaveReview({ subjectId, subjectName, onSubmitted }) {
  const { user } = useAuth()
  const [exchange, setExchange] = useState(undefined) // undefined=loading, null=not eligible
  const [existing, setExisting] = useState(false)
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [workUrl, setWorkUrl] = useState('')
  const [state, setState] = useState(null) // null | 'busy' | 'done' | error string

  useEffect(() => {
    if (!user || user.id === subjectId) { setExchange(null); return }
    async function check() {
      const { data: ex } = await supabase
        .from('contact_exchanges')
        .select('listing_id, created_at')
        .or(`and(requester_id.eq.${user.id},owner_id.eq.${subjectId}),and(requester_id.eq.${subjectId},owner_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setExchange(ex ?? null)
      if (ex) {
        const { data: prior } = await supabase
          .from('reviews')
          .select('id')
          .eq('author_id', user.id)
          .eq('subject_id', subjectId)
          .eq('listing_id', ex.listing_id)
          .maybeSingle()
        setExisting(Boolean(prior))
      }
    }
    check()
  }, [user, subjectId])

  if (!user || user.id === subjectId || exchange === undefined || exchange === null || existing) return null

  async function submit(e) {
    e.preventDefault()
    setState('busy')
    const { error } = await supabase.from('reviews').insert({
      author_id: user.id,
      subject_id: subjectId,
      listing_id: exchange.listing_id,
      rating,
      body: body.trim(),
      work_url: workUrl.trim() || null,
    })
    setState(error ? error.message : 'done')
    if (!error) onSubmitted?.()
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        Review submitted. {subjectName} will be asked to confirm you worked together —
        it goes live once they do (or after 14 days as a one-party review).
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      {!open ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            You connected with {subjectName} through Web Works. How did it go?
          </p>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Leave a review
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Rating</label>
            <Stars value={rating} size={22} onChange={setRating} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Your review</label>
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={2000} required
              placeholder="What was delivered? How was communication, timeline, quality? (at least 20 characters)"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Link to the delivered work <span className="font-normal text-slate-400">(optional, but earns the strongest badge)</span>
            </label>
            <input
              type="url" value={workUrl} onChange={(e) => setWorkUrl(e.target.value)} placeholder="https://the-site-they-built.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              We check the link is live and plausibly matches your description. Not public work? Leave it blank.
            </p>
          </div>
          {state && state !== 'busy' && <p className="text-sm text-red-600">{state}</p>}
          <div className="flex gap-2">
            <button
              disabled={rating === 0 || body.trim().length < 20 || state === 'busy'}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              {state === 'busy' ? 'Submitting…' : 'Submit review'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
