import { handleImageUpload } from '@/lib/image-upload.server'

export const POST = (req: Request) => handleImageUpload(req, { bucket: 'blog-images', allowGif: true })
