import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('Supabase env vars missing. Copy .env.example to .env.local and fill them in.')
}

export const supabase = createClient(url, anonKey)

export const SKILL_OPTIONS = [
  'React', 'Vue', 'Angular', 'Svelte', 'JavaScript', 'TypeScript',
  'Node.js', 'Python', 'PHP', 'Ruby on Rails', 'Java', '.NET',
  'WordPress', 'Shopify', 'Squarespace', 'Webflow', 'Wix',
  'HTML/CSS', 'Tailwind', 'UI/UX Design', 'Figma',
  'Supabase', 'Firebase', 'PostgreSQL', 'MySQL', 'MongoDB',
  'AWS', 'Vercel', 'Stripe Integration', 'API Development', 'E-commerce',
  'SEO', 'Accessibility', 'Testing/QA', 'DevOps',
]
