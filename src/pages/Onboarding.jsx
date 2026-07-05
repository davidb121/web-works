import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/uploadImage'
import { Wrench, Briefcase, Users, ImagePlus } from 'lucide-react'

const ROLES = [
  { value: 'freelancer', label: 'I want work', desc: 'Advertise your skills and availability', icon: Wrench },
  { value: 'client', label: 'I need talent', desc: 'Post projects and find developers', icon: Briefcase },
  { value: 'both', label: 'Both', desc: 'A bit of each', icon: Users },
]

export default function Onboarding() {
  const { user, profile, refreshProfile, loading } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState(profile?.type ?? null)
  const [name, setName] = useState(profile?.display_name ?? user?.user_metadata?.full_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [website, setWebsite] = useState(profile?.website_url ?? '')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(profile?.avatar_url || profile?.company_logo_url || null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (!loading && !user) { navigate('/login', { replace: true }); return null }

  const isCompany = role === 'client'

  async function save(e) {
    e.preventDefault()
    if (!role) { setError('Pick how you plan to use Web Works.'); return }
    setBusy(true); setError(null)
    try {
      let imageUrl = null
      if (imageFile) imageUrl = await uploadImage(imageFile, user.id, isCompany ? 'logo' : 'avatar')
      const row = {
        user_id: user.id,
        type: role,
        display_name: name.trim(),
        bio: bio.trim(),
        website_url: website.trim() || null,
        ...(imageUrl ? (isCompany ? { company_logo_url: imageUrl } : { avatar_url: imageUrl }) : {}),
      }
      const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'user_id' })
      if (error) throw error
      await refreshProfile()
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <h1 className="text-3xl font-bold">Set up your profile</h1>
      <p className="mt-1 text-slate-500">Takes about 30 seconds. You can change everything later.</p>

      <form onSubmit={save} className="mt-8 space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLES.map(({ value, label, desc, icon: Icon }) => (
            <button
              type="button" key={value} onClick={() => setRole(value)}
              className={`rounded-2xl border p-4 text-left transition ${role === value ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <Icon size={20} className={role === value ? 'text-brand-600' : 'text-slate-400'} />
              <div className="mt-2 font-semibold">{label}</div>
              <div className="text-xs text-slate-500">{desc}</div>
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{isCompany ? 'Name or company name' : 'Display name'}</label>
          <input
            required value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {isCompany ? 'Company logo' : 'Photo'} <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-4">
            {preview ? (
              <img src={preview} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><ImagePlus size={22} /></span>
            )}
            <span className="text-sm text-brand-600 hover:underline">Upload image</span>
            <input
              type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)) }
              }}
            />
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Short bio <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea
            value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500}
            placeholder={isCompany ? 'What does your business do?' : 'What do you build? What are you great at?'}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Website or portfolio <span className="font-normal text-slate-400">(optional)</span></label>
          <input
            type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={busy} className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? 'Saving…' : 'Save and continue'}
        </button>
      </form>
    </div>
  )
}
