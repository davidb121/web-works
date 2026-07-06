/** Curated web-dev skill options shown as toggle chips during onboarding. */
export const WEB_SKILLS = [
  'HTML/CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'Svelte',
  'Node.js',
  'Python/Django',
  'PHP/Laravel',
  'WordPress',
  'Shopify',
  'Ruby on Rails',
  'REST APIs',
  'GraphQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Supabase/Firebase',
  'AWS',
  'DevOps/CI',
  'UI/UX design',
  'Tailwind CSS',
  'Accessibility',
  'SEO',
  'E-commerce',
  'Web performance',
]

/** All IANA zones the browser knows, with a safe fallback list. */
export function getTimezones() {
  if (typeof Intl.supportedValuesOf === 'function') {
    try { return Intl.supportedValuesOf('timeZone') } catch { /* fall through */ }
  }
  return [
    'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver',
    'America/Phoenix', 'America/Chicago', 'America/New_York', 'America/Sao_Paulo',
    'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Kyiv',
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Shanghai', 'Asia/Tokyo',
    'Australia/Sydney', 'Pacific/Auckland',
  ]
}

export function detectTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' }
}
