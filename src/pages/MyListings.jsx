import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, SKILL_OPTIONS } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { PageSpinner } from '../App'
import { Pencil, X } from 'lucide-react'

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  pending_payment: 'bg-amber-50 text-amber-700',
  expired: 'bg-slate-100 text-slate-500',
  removed: 'bg-red-50 text-red-600',
}

function validEdit(f) {
  return (
    f.title.trim().length >= 8 && f.title.trim().length <= 90 &&
    f.description.trim().length >= 40 && f.description.trim().length <= 3000 &&
    f.contact_info.trim().length >= 5 && f.contact_info.trim().length <= 200
  )
}

function EditListingModal({ listing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    engagement: listing.engagement || 'one_time',
    budget_min: listing.budget_min ?? '',
    budget_max: listing.budget_max ?? '',
    skills: listing.skills || [],
    contact_info: listing.contact_info ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // contact_info is hidden from direct selects (reveal-gated), so owners
  // fetch their own via RPC when the modal opens.
  useEffect(() => {
    if (listing.contact_info == null) {
      supabase.rpc('my_listing_contact', { p_listing_id: listing.id })
        .then(({ data }) => { if (data != null) set('contact_info', data) })
    }
  }, [listing.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSkill(s) {
    set('skills', form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s].slice(0, 8))
  }

  async function save() {
    setBusy(true); setError(null)
    const { data, error } = await supabase
      .from('listings')
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        engagement: form.engagement,
        budget_min: form.budget_min === '' ? null : Number(form.budget_min),
        budget_max: form.budget_max === '' ? null : Number(form.budget_max),
        skills: form.skills,
        contact_info: form.contact_info.trim(),
      })
      .eq('id', listing.id)
      .select()
      .single()
    setBusy(false)
    if (error) { setError(error.message); return }
    onSaved(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit listing</h2>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={90}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={form.description} onChange={(e) => set('description', e.target.value)} rows={6} maxLength={3000}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-slate-400">{form.description.trim().length}/3000 — at least 40 characters</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Engagement</label>
              <div className="inline-flex w-full rounded-xl bg-slate-100 p-1">
                {[['one_time', 'One-time'], ['ongoing', 'Ongoing']].map(([v, l]) => (
                  <button
                    key={v} type="button" onClick={() => set('engagement', v)}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold ${form.engagement === v ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Budget/Rate (USD) <span className="font-normal text-slate-400">(optional)</span></label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" value={form.budget_min} onChange={(e) => set('budget_min', e.target.value)} placeholder="Min"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number" min="0" value={form.budget_max} onChange={(e) => set('budget_max', e.target.value)} placeholder="Max"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Skills <span className="font-normal text-slate-400">(up to 8)</span></label>
            <div className="flex flex-wrap gap-1.5">
              {[...SKILL_OPTIONS, ...form.skills.filter((s) => !SKILL_OPTIONS.includes(s))].map((s) => (
                <button
                  key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${form.skills.includes(s) ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-300 hover:ring-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Contact info</label>
            <input
              value={form.contact_info} onChange={(e) => set('contact_info', e.target.value)} maxLength={200}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 font-semibold hover:bg-slate-50">Cancel</button>
            <button
              onClick={save} disabled={busy || !validEdit(form)}
              className="flex-1 rounded-xl bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MyListings() {
  const { user, session } = useAuth()
  const [listings, setListings] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [editingListing, setEditingListing] = useState(null)

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
              <div className="flex shrink-0 items-center gap-2">
                {l.status !== 'removed' && (
                  <button
                    onClick={() => setEditingListing(l)}
                    className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
                {l.status === 'pending_payment' && (
                  <button
                    onClick={() => resumePayment(l.id)} disabled={busyId === l.id}
                    className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {busyId === l.id ? '…' : 'Finish payment'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSaved={(updated) => {
            setListings((ls) => ls.map((l) => (l.id === updated.id ? updated : l)))
            setEditingListing(null)
          }}
        />
      )}
    </div>
  )
}
