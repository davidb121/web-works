// Tiny text helpers: relative dates + safe URL auto-linking.

const URL_SPLIT = /(https?:\/\/[^\s<>"')\]]+)/g

/** Split text and wrap bare URLs in safe external links. */
export function linkify(text) {
  if (!text) return text
  return text.split(URL_SPLIT).map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="break-all text-brand-600 underline"
      >
        {part}
      </a>
    ) : (
      part
    ),
  )
}

/** "12m ago", "5h ago", "3d ago", then a plain date. */
export function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}
