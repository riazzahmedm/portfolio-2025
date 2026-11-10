import test from 'node:test'
import assert from 'node:assert/strict'
import { accentFromHex, isHexColor } from './cover-accent.ts'

const rgb = (s: string) => s.split(',').map(Number)
const lum = (s: string) => { const [r, g, b] = rgb(s); return 0.2126 * r + 0.7152 * g + 0.0722 * b }

test('isHexColor accepts six-digit hex colours only', () => {
  assert.equal(isHexColor('#8a97a8'), true)
  assert.equal(isHexColor('#8A97A8'), true)
  for (const bad of ['8a97a8', '#fff', '#8a97a', '#8a97a8ff', '#gggggg', '', null, undefined, 12]) assert.equal(isHexColor(bad), false, String(bad))
})

test('accentFromHex gives a bright shade for the dark page and a deep one for the light paper', () => {
  const a = accentFromHex('#8a97a8')!
  assert.ok(lum(a.dark) > 140, `dark shade should be bright, got ${lum(a.dark)}`)
  assert.ok(lum(a.light) < 100, `light shade should be deep, got ${lum(a.light)}`)
  assert.ok(lum(a.dark) > lum(a.light))
})

test('accentFromHex keeps the hue of a blue-grey: blue stays the strongest channel in both shades', () => {
  const a = accentFromHex('#8a97a8')!
  for (const shade of [a.dark, a.light]) {
    const [r, g, b] = rgb(shade)
    assert.ok(b >= g && g >= r, `${shade} should stay blue-grey`)
  }
})

test('accentFromHex brightens a very dark colour and darkens a very light one', () => {
  assert.ok(lum(accentFromHex('#1a2433')!.dark) > 120)
  assert.ok(lum(accentFromHex('#e8eef5')!.light) < 100)
})

test('accentFromHex returns null for anything that is not a six-digit hex colour', () => {
  assert.equal(accentFromHex('slate'), null)
  assert.equal(accentFromHex(''), null)
  assert.equal(accentFromHex(null), null)
})
