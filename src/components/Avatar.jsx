export default function Avatar({ profile, size = 40 }) {
  const src = profile?.avatar_url || profile?.company_logo_url
  const initial = (profile?.display_name || '?').trim().charAt(0).toUpperCase()
  if (src) {
    return (
      <img
        src={src}
        alt={profile?.display_name || 'avatar'}
        width={size}
        height={size}
        className="rounded-full object-cover ring-1 ring-slate-200"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ring-1 ring-slate-200"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  )
}
