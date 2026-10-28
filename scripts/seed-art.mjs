// One-off: import the art from the old portfolio site into the art gallery.
//   node --env-file=.env.local scripts/seed-art.mjs /path/to/portfolio/art/img/bg-img [--dry]
// Images are resized to 2000px WebP, uploaded to the shop-images bucket under art/, and inserted into art_pieces.
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const dir = process.argv[2]
const dry = process.argv.includes('--dry')
if (!dir) { console.error('Pass the bg-img folder'); process.exit(1) }

// Titles and captions from the old gallery; everything else is imported as Untitled and can be named in admin
const NAMED = {
  g1:  ['Elegant Beauté', 'Grace in every glance, beauty in every breath.'],
  g2:  ['Poonguzhali', 'Alaikadal aazham nilavu ariyaadhoo! Adi mana dhaagam vizhiyil theriyaadhoo!'],
  g3:  ['Run Lola Run', 'Hope ahead!'],
  g10: ['Semmaan Magalai', 'Semmaan magalai.. Thirudum thirudan..'],
  g14: ['Nilaavin Karai', null],
  g15: ['Belly Chain', 'Stay hidden until..'],
  g21: ['Goth', 'Unleash your gothic side, we have styles for you—cool and edgy.'],
  g22: ['Betta Splendens', 'Let your fins flow with the current like betta splendens'],
  g28: ['Hope', 'Sunshine'],
  g31: ['Rosa-Sinensis', 'She looked attractive in all seasons like Hibiscus'],
  g40: ['Aadai', null],
  g44: ['Diwann', 'Queen'],
  g45: ['Lavender Nirame', 'Look at her now!'],
}
const num = f => Number(f.match(/^g(\d+)\./i)?.[1])

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const files = (await readdir(dir)).filter(f => /^g\d+\.(jpe?g|png)$/i.test(f)).sort((a, b) => num(a) - num(b))

// The six most-featured pieces lead the gallery, the rest follow newest-numbered first
const featured = Object.keys(NAMED).map(k => files.find(f => f.toLowerCase().startsWith(k + '.'))).filter(Boolean)
const ordered = [...featured, ...files.filter(f => !featured.includes(f)).reverse()]
console.log(`${ordered.length} images (${featured.length} named)${dry ? ' [dry run]' : ''}`)

const { count } = await db.from('art_pieces').select('*', { count: 'exact', head: true })
if (count && !dry) { console.error(`art_pieces already has ${count} rows — refusing to seed twice`); process.exit(1) }

let i = 0
for (const f of ordered) {
  const key = f.replace(/\.[^.]+$/, '').toLowerCase()
  const [title, caption] = NAMED[key] ?? ['Untitled', null]
  const img = sharp(await readFile(path.join(dir, f)), { failOn: 'none' }).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 84 })
  const { data: buf, info } = await img.toBuffer({ resolveWithObject: true })
  if (dry) { console.log(f, title, `${info.width}x${info.height}`, `${Math.round(buf.length / 1024)}KB`); i++; continue }

  const name = `art/${key}-${Date.now()}.webp`
  const up = await db.storage.from('shop-images').upload(name, buf, { contentType: 'image/webp', upsert: false })
  if (up.error) { console.error('upload failed', f, up.error.message); process.exit(1) }
  const { data: { publicUrl } } = db.storage.from('shop-images').getPublicUrl(name)
  const ins = await db.from('art_pieces').insert({ title, caption, image_url: publicUrl, width: info.width, height: info.height, sort_order: i })
  if (ins.error) { console.error('insert failed', f, ins.error.message); process.exit(1) }
  console.log(`${++i}/${ordered.length}`, f, '→', title)
}
