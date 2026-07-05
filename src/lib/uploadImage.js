import { supabase } from './supabase'

/**
 * Client-side resize to a max dimension, then upload to the `avatars` bucket.
 * Returns the public URL.
 */
export async function uploadImage(file, userId, kind = 'avatar', maxSize = 512) {
  const img = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = reject
    image.src = url
  })

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
  const path = `${userId}/${kind}-${Date.now()}.webp`

  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    contentType: 'image/webp',
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
