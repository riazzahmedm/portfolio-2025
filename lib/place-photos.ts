import { compressImage } from '@/lib/compress-image'

/** Shrinks a photo in the browser (max 1600px) and uploads it; resolves to its public URL, throws a readable Error otherwise. */
export async function uploadPlacePhoto(file: File): Promise<string> {
  let small: File
  try { small = await compressImage(file, 1600, 0.82) } catch { throw new Error('That photo could not be read. Try a JPEG, PNG or WebP image.') }
  const form = new FormData()
  form.append('file', small)
  const res = await fetch('/api/places/upload', { method: 'POST', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Photo upload failed')
  return data.url as string
}
