export function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale  = Math.min(1, maxWidth / img.naturalWidth)
      const w      = Math.round(img.naturalWidth  * scale)
      const h      = Math.round(img.naturalHeight * scale)
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return }
      ctx.drawImage(img, 0, 0, w, h)
      // JPEG stays JPEG; anything that may carry transparency (PNG/WebP/GIF) becomes WebP, which keeps alpha and still compresses
      const wantType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Canvas compression failed')); return }
        // Browsers without WebP encoding silently return PNG — trust the blob's real type
        const ext = blob.type === 'image/jpeg' ? '.jpg' : blob.type === 'image/webp' ? '.webp' : '.png'
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ext), { type: blob.type }))
      }, wantType, quality)
    }
    img.onerror = reject
    img.src = objectUrl
  })
}
