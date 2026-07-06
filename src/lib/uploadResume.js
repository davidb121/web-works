import { supabase } from './supabase'

const MAX_BYTES = 5 * 1024 * 1024 // matches the bucket's file_size_limit

/** Upload a PDF resume to the `resumes` bucket. Returns the public URL. */
export async function uploadResume(file, userId) {
  if (file.type !== 'application/pdf') throw new Error('Resume must be a PDF.')
  if (file.size > MAX_BYTES) throw new Error('Resume must be 5 MB or smaller.')

  const path = `${userId}/resume-${Date.now()}.pdf`
  const { error } = await supabase.storage.from('resumes').upload(path, file, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from('resumes').getPublicUrl(path)
  return data.publicUrl
}
