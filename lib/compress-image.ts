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
      const isPng   = file.type === 'image/png'
      const outType = isPng ? 'image/png' : 'image/jpeg'
      const outExt  = isPng ? '.png' : '.jpg'
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Canvas compression failed')); return }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, outExt), { type: outType }))
      }, outType, isPng ? undefined : quality)
    }
    img.onerror = reject
    img.src = objectUrl
  })
}
