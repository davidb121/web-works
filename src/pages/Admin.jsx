// Minimal moderation page — admins only.
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Stars, ReviewBadge } from '../components/reviews'
import { PageSpinner } from '../App'

export default function Admin() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState(null)
  const [pendingReviews, setPendingReviews] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) navigate('/', { replace: true })
  }, [loading, user, profile, navigate])

  async function load() {
    const [{ data: rep }, { data: rev }] = await Promise.all([
      supabase
        .from('reports')
        .select('*, reporter:profiles!reports_reporter_id_fkey(user_id, display_name)')
        .eq('status', 'open')
        .order('created_at', { ascending: true }),
      supabase
        .from('reviews')
        .select('*, author:profiles!reviews_author_id_fkey(user_id, display_name), subject:profiles!reviews_subject_id_fkey(user_id, display_name)')
        .in('status', ['pending_confirmation', 'pending_verification'])
        .order('created_at', { ascending: true }),
    ])
    setReports(rep ?? [])
    setPendingReviews(rev ?? [])
  }

  useEffect(() => { if (profile?.is_admin) load() }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  async function act(fn, args, id) {
    setBusyId(id); setError(null)
    const { error } = await supabase.rpc(fn, args)
    if (error) setError(error.message)
    setBusyId(null)
    load()
  }

  if (loading || !profile?.is_admin || reports === null) return <PageSpinner />

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <h1 className="text-3xl font-bold">Moderation</h1>

      <h2 className="mt-8 text-lg font-bold">Open reports ({reports.length})</h2>
      {reports.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Queue's empty.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700 capitalize">{r.target_type}</span>
                <span>reported by {r.reporter?.display_name ?? 'unknown'}</span>
                <span>· {new Date(r.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.reason}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {r.target_type === 'listing' && (
                  <>
                    <Link to={`/listing/${r.target_id}`} className="text-sm font-medium text-brand-600 hover:underline">View listing</Link>
                    <button
                      onClick={() => act('admin_remove_listing', { p_listing_id: r.target_id }, r.id)}
                      disabled={busyId === r.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove listing
                    </button>
                  </>
                )}
                {r.target_type === 'profile' && (
                  <Link to={`/profile/${r.target_id}`} className="text-sm font-medium text-brand-600 hover:underline">View profile</Link>
                )}
                {r.target_type === 'review' && (
                  <button
                    onClick={() => act('admin_reject_review', { p_review_id: r.target_id }, r.id)}
                    disabled={busyId === r.id}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject review
                  </button>
                )}
                <button
                  onClick={() => act('admin_resolve_report', { p_report_id: r.id }, r.id)}
                  disabled={busyId === r.id}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Mark resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-lg font-bold">Reviews in flight ({pendingReviews?.length ?? 0})</h2>
      {pendingReviews?.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">None pending.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {pendingReviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">{r.author?.display_name}</span>
                <span className="text-slate-400">→</span>
                <span className="font-semibold">{r.subject?.display_name}</span>
                <Stars value={r.rating} />
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{r.status}</span>
                <ReviewBadge badge={r.badge} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.body}</p>
              <button
                onClick={() => act('admin_reject_review', { p_review_id: r.id }, r.id)}
                disabled={busyId === r.id}
                className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  )
}
