import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/uploadImage'
import { uploadResume } from '../lib/uploadResume'
import { WEB_SKILLS, getTimezones, detectTimezone } from '../lib/webSkills'
import { Wrench, Briefcase, Users, ImagePlus, FileText, X } from 'lucide-react'

const ROLES = [
  { value: 'freelancer', label: 'I want work', desc: 'Advertise your skills and availability', icon: Wrench },
  { value: 'client', label: 'I need talent', desc: 'Post projects and find developers', icon: Briefcase },
  { value: 'both', label: 'Both', desc: 'A bit of each', icon: Users },
]

const MAX_SKILLS = 20

export default function Onboarding() {
  const { user, profile, refreshProfile, loading } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState(profile?.type ?? null)
  const [name, setName] = useState(profile?.display_name ?? user?.user_metadata?.full_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [website, setWebsite] = useState(profile?.website_url ?? '')
  const [linkedin, setLinkedin] = useState(profile?.linkedin_url ?? '')
  const [timezone, setTimezone] = useState(profile?.timezone ?? detectTimezone())
  const [skills, setSkills] = useState(profile?.skills ?? [])
  const [customSkill, setCustomSkill] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(profile?.avatar_url || profile?.company_logo_url || null)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeName, setResumeName] = useState(profile?.resume_url ? 'Current resume on file' : null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (!loading && !user) { navigate('/login', { replace: true }); return null }

  const isCompany = role === 'client'
  const seeksWork = role === 'freelancer' || role === 'both'

  function toggleSkill(s) {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s)
      : prev.length >= MAX_SKILLS ? prev
      : [...prev, s],
    )
  }

  function addCustomSkill() {
    const s = customSkill.trim()
    if (s && !skills.includes(s) && skills.length < MAX_SKILLS) setSkills([...skills, s])
    setCustomSkill('')
  }

  async function save(e) {
    e.preventDefault()
    if (!role) { setError('Pick how you plan to use Web Works.'); return }
    setBusy(true); setError(null)
    try {
      let imageUrl = null
      if (imageFile) imageUrl = await uploadImage(imageFile, user.id, isCompany ? 'logo' : 'avatar')
      let resumeUrl = null
      if (seeksWork && resumeFile) resumeUrl = await uploadResume(resumeFile, user.id)
      const row = {
        user_id: user.id,
        type: role,
        display_name: name.trim(),
        bio: bio.trim(),
        website_url: website.trim() || null,
        linkedin_url: seeksWork && linkedin.trim() ? linkedin.trim() : null,
        timezone,
        skills: seeksWork ? skills : [],
        ...(imageUrl ? (isCompany ? { company_logo_url: imageUrl } : { avatar_url: imageUrl }) : {}),
        ...(resumeUrl ? { resume_url: resumeUrl }
          : !resumeName && profile?.resume_url ? { resume_url: null } // user removed it
          : {}),
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
      <p className="mt-1 text-slate-500">Takes about a minute. You can change everything later.</p>

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

        {seeksWork && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">LinkedIn profile <span className="font-normal text-slate-400">(optional)</span></label>
              <input
                type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/yourname"
                pattern="https://(www\.)?linkedin\.com/.*"
                title="Must be a linkedin.com URL"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Resume <span className="font-normal text-slate-400">(optional — PDF, max 5 MB, shown on your public profile)</span></label>
              {resumeName ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm">
                  <FileText size={16} className="shrink-0 text-brand-600" />
                  <span className="min-w-0 flex-1 truncate">{resumeName}</span>
                  <button
                    type="button" title="Remove"
                    onClick={() => { setResumeFile(null); setResumeName(null) }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm text-brand-600 hover:border-brand-400 hover:bg-brand-50">
                  <FileText size={16} /> Upload PDF resume
                  <input
                    type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) { setResumeFile(f); setResumeName(f.name) }
                    }}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Skills <span className="font-normal text-slate-400">(pick up to {MAX_SKILLS})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[...WEB_SKILLS, ...skills.filter((s) => !WEB_SKILLS.includes(s))].map((s) => {
                  const on = skills.includes(s)
                  return (
                    <button
                      type="button" key={s} onClick={() => toggleSkill(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600'}`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} maxLength={30}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill() } }}
                  placeholder="Something else? Type it and press Enter"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button" onClick={addCustomSkill}
                  className="rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Add
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Your time zone</label>
          <select
            value={timezone} onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {getTimezones().map((tz) => (
              <option key={tz} value={tz}>{tz.replaceAll('_', ' ')}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Detected automatically — shown on your profile so people know your working hours.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={busy} className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? 'Saving…' : 'Save and continue'}
        </button>
      </form>
    </div>
  )
}
