/**
 * Import a blog post from an HTML file.
 * Usage: node scripts/import-blog-post.mjs
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

const HTML_FILE  = resolve('/Users/riazahmed/Downloads/chikmagalur_blog_v2.html')
const API_BASE   = 'http://localhost:3000'
const PASSWORD   = process.env.MOVIES_ADMIN_PASSWORD

const raw = readFileSync(HTML_FILE, 'utf8')

// Extract everything inside <body>…</body> (strip the outer shell + <style>)
const bodyMatch  = raw.match(/<body>([\s\S]*?)<\/body>/i)
const bodyHtml   = bodyMatch ? bodyMatch[1].trim() : raw

// Also extract the <style> block from <head> so inline styles render correctly
const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/i)
const inlineCSS  = styleMatch ? `<style>${styleMatch[1]}</style>` : ''

const content = [
  {
    type:    'html',
    content: inlineCSS + '\n' + bodyHtml,
  },
]

const post = {
  title:       'Five Boys, Three Bikes, and a Bus That Crushed Our Souls',
  slug:        'chikmagalur-2026',
  excerpt:     'A Chikmagalur trip report — featuring waterfalls, fog-covered peaks, very good biryani, and one waterfall we climbed out of purely out of fear.',
  cover_image: null,
  tags:        ['travel', 'karnataka', 'trip-report'],
  published:   true,
  content,
}

// Login to get the session cookie
const loginRes = await fetch(`${API_BASE}/api/auth/blog`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ password: PASSWORD }),
})
if (!loginRes.ok) { console.error('❌ Login failed — check MOVIES_ADMIN_PASSWORD'); process.exit(1) }
const cookie = loginRes.headers.get('set-cookie') ?? ''

const res = await fetch(`${API_BASE}/api/blog`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json', Cookie: cookie },
  body: JSON.stringify(post),
})

const data = await res.json()
if (!res.ok) {
  console.error('❌ Failed:', data)
  process.exit(1)
}
console.log('✅ Post created:', data.slug)
console.log(`   → ${API_BASE}/blog/${data.slug}`)
