import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, SKILL_OPTIONS } from '../lib/supabase'
import { Briefcase, Wrench, Check } from 'lucide-react'

const STEPS = ['Describe', 'Preview', 'Pay']

export default function PostAd() {
  const { user, session } = useAuth()
  const [step, setStep] = useState(0)
  const [promoLeft, setPromoLeft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    kind: 'project',
    title: '',
    description: '',
    engagement: 'one_time',
    budget_min: '',
    budget_max: '',
    skills: [],
    contact_info: '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isProject = form.kind === 'project'

  useEffect(() => {
    supabase.rpc('promo_remaining').then(({ data }) => setPromoLeft(typeof data === 'number' ? data : 0))
  }, [])

  const promoApplies = isProject && promoLeft > 0
  const firstMonthPrice = promoApplies ? '$2' : '$5'

  function toggleSkill(s) {
    set('skills', form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s].slice(0, 8))
  }

  function validStep0() {
    return form.title.trim().length >= 8 && form.description.trim().length >= 40 && form.contact_info.trim().length >= 5
  }

  async function checkout() {
    setBusy(true); setError(null)
    try {
      // 1. Create the listing in pending_payment
      const { data: listing, error: insErr } = await supabase
        .from('listings')
        .insert({
          owner_id: user.id,
          kind: form.kind,
          title: form.title.trim(),
          description: form.description.trim(),
          engagement: form.engagement,
          budget_min: form.budget_min ? Number(form.budget_min) : null,
          budget_max: form.budget_max ? Number(form.budget_max) : null,
          skills: form.skills,
          contact_info: form.contact_info.trim(),
          status: 'pending_payment',
        })
        .select()
        .single()
      if (insErr) throw insErr

      // 2. Ask the edge function for a Stripe Checkout URL
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ listing_id: listing.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Checkout failed')
      window.location.href = json.url
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </span>
            <span className={`text-sm font-medium ${i === step ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-slate-300" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'project', label: 'I need something built', desc: 'Post a project', icon: Briefcase },
              { value: 'talent', label: 'I do web work', desc: 'Advertise your skills', icon: Wrench },
            ].map(({ value, label, desc, icon: Icon }) => (
              <button
                type="button" key={value} onClick={() => set('kind', value)}
                className={`rounded-2xl border p-4 text-left transition ${form.kind === value ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <Icon size={20} className={form.kind === value ? 'text-brand-600' : 'text-slate-400'} />
                <div className="mt-2 text-sm font-semibold">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={90}
              placeholder={isProject ? 'e.g. Build a booking site for my salon' : 'e.g. React developer for hire — fast, reliable'}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={form.description} onChange={(e) => set('description', e.target.value)} rows={6} maxLength={3000}
              placeholder={isProject ? 'What do you need built? Scope, pages, features, timeline…' : 'What do you build? Experience, availability, links to work…'}
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
              <label className="mb-1 block text-sm font-medium">
                {isProject ? 'Budget (USD)' : 'Rate (USD)'} <span className="font-normal text-slate-400">(optional)</span>
              </label>
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
              {SKILL_OPTIONS.map((s) => (
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
              placeholder="Email, phone, or however you want to be reached"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-slate-400">Only shown to signed-in users who click “Reveal contact” on your ad.</p>
          </div>

          <button
            disabled={!validStep0()}
            onClick={() => setStep(1)}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Preview ad
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isProject ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}>
              {isProject ? 'Project' : 'Talent'}
            </span>
            <h2 className="mt-3 text-2xl font-bold">{form.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-slate-700">{form.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {form.skills.map((s) => <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>)}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold hover:bg-slate-50">Edit</button>
            <button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">Looks good</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Publish your ad</h2>
          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between"><span>Monthly ad fee</span><span className="font-semibold">$5.00/mo</span></div>
            {promoApplies && (
              <div className="flex justify-between text-emerald-700">
                <span>Launch special — first month ({promoLeft} left)</span><span className="font-semibold">$2.00</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
              <span>Due today</span><span>{firstMonthPrice}.00</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Renews at $5/month until you cancel. Cancel anytime from My Listings — your ad stays up through the period you paid for.
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            onClick={checkout} disabled={busy}
            className="mt-5 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? 'Redirecting to Stripe…' : `Pay ${firstMonthPrice} and publish`}
          </button>
          <button onClick={() => setStep(1)} className="mt-3 w-full text-center text-sm text-slate-500 hover:underline">Back</button>
        </div>
      )}
    </div>
  )
}
