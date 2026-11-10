import { handleImageUpload } from '@/lib/image-upload.server'

export const POST = (req: Request) => handleImageUpload(req, {
  bucket: 'place-photos',
  // Before the SQL block runs there is no bucket yet: say so instead of a generic failure
  missingBucketMessage: 'Run the Been there SQL block in supabase/migrations.sql first',
})
