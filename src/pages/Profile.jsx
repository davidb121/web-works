import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import ListingCard from '../components/ListingCard'
import { PageSpinner } from '../App'
import { ExternalLink, Pencil, Linkedin, FileText, Clock } from 'lucide-react'
import { Stars, ReviewCard, ReportButton } from '../components/reviews'
import LeaveReview from '../components/LeaveReview'

function localTime(tz) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date())
  } catch {
    return null
  }
}

export default function Profile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(undefined)
  const [listings, setListings] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('profiles').select('*').eq('user_id', id).maybeSingle()
      setProfile(p ?? null)
      const { data: ls } = await supabase
        .from('listings').select('*')
        .eq('owner_id', id).eq('status', 'active')
        .order('created_at', { ascending: false })
      setListings(ls ?? [])
      const { data: rs } = await supabase
        .from('reviews')
        .select('*, author:profiles!reviews_author_id_fkey(user_id, display_name, avatar_url, company_logo_url)')
        .eq('subject_id', id).eq('status', 'live')
        .order('created_at', { ascending: false })
      setReviews(rs ?? [])
    }
    load()
  }, [id])

  if (profile === undefined) return <PageSpinner />
  if (profile === null) return <p className="py-24 text-center text-slate-500">Profile not found.</p>

  const isMe = user?.id === id

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Avatar profile={profile} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h1 className="truncate text-2xl font-bold">{profile.display_name}</h1>
            {isMe && (
              <Link to="/onboarding" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                <Pencil size={14} /> Edit
              </Link>
            )}
          </div>
          <p className="text-sm capitalize text-slate-500">
            {profile.type === 'both' ? 'Freelancer & hiring' : profile.type}
          </p>
          {profile.review_count > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <Stars value={profile.avg_rating ?? 0} />
              <span className="font-semibold">{Number(profile.avg_rating).toFixed(1)}</span>
              <span className="text-slate-400">({profile.review_count} review{profile.review_count === 1 ? '' : 's'})</span>
            </p>
          )}
          {profile.bio && <p className="mt-3 whitespace-pre-wrap text-slate-700">{profile.bio}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {profile.website_url && (
              <a
                href={profile.website_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                {profile.website_url.replace(/^https?:\/\//, '')} <ExternalLink size={13} />
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            {profile.resume_url && (
              <a
                href={profile.resume_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <FileText size={14} /> Resume
              </a>
            )}
            {profile.timezone && localTime(profile.timezone) && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500" title={profile.timezone}>
                <Clock size={14} /> {localTime(profile.timezone)} local time
              </span>
            )}
          </div>
          {profile.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {!isMe && (
        <div className="mt-6">
          <LeaveReview subjectId={id} subjectName={profile.display_name} />
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-bold">Active ads</h2>
      {listings.length === 0 ? (
        <p className="text-sm text-slate-500">No active ads.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-bold">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      {!isMe && (
        <div className="mt-8">
          <ReportButton targetType="profile" targetId={id} />
        </div>
      )}
    </div>
  )
}
