import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { PageSpinner } from '../App'

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  pending_payment: 'bg-amber-50 text-amber-700',
  expired: 'bg-slate-100 text-slate-500',
  removed: 'bg-red-50 text-red-600',
}

export default function MyListings() {
  const { user, session } = useAuth()
  const [listings, setListings] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setListings(data ?? []))
  }, [user.id])

  async function openBillingPortal() {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ portal: true }),
    })
    const json = await res.json()
    if (json.url) window.location.href = json.url
  }

  async function resumePayment(listingId) {
    setBusyId(listingId)
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ listing_id: listingId }),
    })
    const json = await res.json()
    setBusyId(null)
    if (json.url) window.location.href = json.url
  }

  if (listings === null) return <PageSpinner />

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My listings</h1>
        <button onClick={openBillingPortal} className="text-sm font-medium text-brand-600 hover:underline">
          Manage billing
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-medium text-slate-700">No ads yet.</p>
          <Link to="/post" className="mt-1 inline-block text-sm text-brand-600 underline">Post your first ad</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {listings.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <Link to={`/listing/${l.id}`} className="block truncate font-semibold hover:text-brand-700">{l.title}</Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLES[l.status] || ''}`}>
                    {l.status.replace('_', ' ')}
                  </span>
                  <span>{l.kind === 'project' ? 'Project' : 'Talent'}</span>
                  {l.expires_at && l.status === 'active' && (
                    <span>renews/expires {new Date(l.expires_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              {l.status === 'pending_payment' && (
                <button
                  onClick={() => resumePayment(l.id)} disabled={busyId === l.id}
                  className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {busyId === l.id ? '…' : 'Finish payment'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
