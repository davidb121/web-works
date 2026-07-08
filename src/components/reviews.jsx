// Shared review UI: stars, badges, cards, report button.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import { Star, Flag, BadgeCheck, Link as LinkIcon, UserCheck } from 'lucide-react'

export function Stars({ value = 0, size = 15, onChange = null }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value)
        const star = (
          <Star
            size={size}
            className={filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          />
        )
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5 transition hover:scale-110">
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        )
      })}
    </span>
  )
}

const BADGES = {
  mutual_link: { label: 'Confirmed · Link verified', cls: 'bg-emerald-50 text-emerald-700', Icon: LinkIcon },
  mutual: { label: 'Confirmed', cls: 'bg-brand-50 text-brand-700', Icon: BadgeCheck },
  one_party: { label: 'One-party', cls: 'bg-slate-100 text-slate-500', Icon: UserCheck },
}

export function ReviewBadge({ badge }) {
  const b = BADGES[badge]
  if (!b) return null
  const { label, cls, Icon } = b
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  )
}

export function ReviewCard({ review }) {
  const author = review.author
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <Link to={`/profile/${author?.user_id}`} className="flex min-w-0 items-center gap-2.5">
          <Avatar profile={author} size={32} />
          <span className="truncate text-sm font-semibold hover:underline">{author?.display_name ?? 'User'}</span>
        </Link>
        <ReviewBadge badge={review.badge} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Stars value={review.rating} />
        <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{review.body}</p>
      {review.work_url && review.badge === 'mutual_link' && (
        <a
          href={review.work_url} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
        >
          <LinkIcon size={11} /> See the delivered work
        </a>
      )}
    </div>
  )
}

export function ReportButton({ targetType, targetId }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [state, setState] = useState(null) // null | 'busy' | 'sent' | error string

  if (!user) return null
  if (state === 'sent') return <p className="text-xs text-slate-400">Report sent — thanks for keeping Web Wrx honest.</p>

  async function submit() {
    setState('busy')
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim(),
    })
    setState(error ? error.message : 'sent')
  }

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
          <Flag size={11} /> Report
        </button>
      ) : (
        <div className="mt-2 space-y-2">
          <textarea
            value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={1000}
            placeholder="What's wrong? (at least 10 characters)"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex gap-2">
            <button
              onClick={submit} disabled={reason.trim().length < 10 || state === 'busy'}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
            >
              Send report
            </button>
            <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:underline">Cancel</button>
          </div>
          {state && state !== 'busy' && state !== 'sent' && <p className="text-xs text-red-600">{state}</p>}
        </div>
      )}
    </div>
  )
}
