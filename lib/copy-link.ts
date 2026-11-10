import { toast } from 'sonner'

/** The public address of a blog story, whatever page the button is on (no query string or hash). */
export const storyUrl = (slug: string) => `${window.location.origin}/blog/${slug}`

/**
 * Copies text to the clipboard and says so. Falls back to a hidden text box where the clipboard API is blocked
 * (older browsers, some in-app browsers). Resolves to whether it worked.
 */
export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    try {
      const box = document.createElement('textarea')
      box.value = url
      box.setAttribute('readonly', '')
      box.style.position = 'fixed'
      box.style.opacity = '0'
      document.body.appendChild(box)
      box.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(box)
      if (!ok) throw new Error('copy failed')
    } catch {
      toast.error('Could not copy the link')
      return false
    }
  }
  toast.success('Link copied')
  return true
}
