import test from 'node:test'
import assert from 'node:assert/strict'
import {
  timingForHour, sanitizeVisit, mergeTimeline, pageAfter, groupByMonth, placeStats, theatreStats, canWishlist, visitsNotReady,
  type TimelineEntry,
} from './places-core.ts'

const place = { id: 'p1', kind: 'cafe', name: 'Roast Lab', city: 'Hyderabad', area: null }
function entry(id: string, date: string, extra: Partial<TimelineEntry> = {}): TimelineEntry {
  return {
    id, source: 'visit', date, createdAt: `${date}T10:00:00Z`, place, vibe: null, timing: null, spend: null,
    note: null, photos: [], mustOrder: [], ...extra,
  }
}

test('timingForHour maps the day into four timings', () => {
  const cases: [number, string][] = [[5, 'morning'], [11, 'morning'], [12, 'afternoon'], [16, 'afternoon'], [17, 'evening'], [20, 'evening'], [21, 'night'], [0, 'night'], [4, 'night']]
  for (const [h, want] of cases) assert.equal(timingForHour(h), want, `hour ${h}`)
})

test('sanitizeVisit requires place and a real date when creating', () => {
  assert.ok('error' in sanitizeVisit({ visited_on: '2026-11-10' }, true))
  assert.ok('error' in sanitizeVisit({ place_id: 'p1', visited_on: '2026-13-40' }, true))
  assert.ok('value' in sanitizeVisit({ place_id: 'p1', visited_on: '2026-11-10' }, true))
})

test('sanitizeVisit keeps spend 0 and nulls bad spend, vibe and timing', () => {
  const ok = (b: Record<string, unknown>) => (sanitizeVisit({ place_id: 'p1', visited_on: '2026-11-10', ...b }, true) as { value: Record<string, unknown> }).value
  assert.equal(ok({ spend_per_head: 0 }).spend_per_head, 0)
  assert.equal(ok({ spend_per_head: '-5' }).spend_per_head, null)
  assert.equal(ok({ spend_per_head: 'abc' }).spend_per_head, null)
  assert.equal(ok({ vibe: 'bogus' }).vibe, null)
  assert.equal(ok({ timing: 'noon' }).timing, null)
})

test('sanitizeVisit caps and cleans lists', () => {
  const v = (sanitizeVisit({
    place_id: 'p1', visited_on: '2026-11-10',
    must_order: Array.from({ length: 20 }, (_, i) => (i === 0 ? '  Filter coffee  ' : i === 1 ? '   ' : `dish ${i}`)),
    photos: [...Array.from({ length: 9 }, (_, i) => `https://x.test/${i}.jpg`), 'javascript:alert(1)'],
  }, true) as { value: { must_order: string[]; photos: string[] } }).value
  assert.equal(v.must_order.length, 12)
  assert.equal(v.must_order[0], 'Filter coffee')
  assert.ok(!v.must_order.includes(''))
  assert.equal(v.photos.length, 8)
  assert.ok(v.photos.every(u => u.startsWith('http')))
})

test('sanitizeVisit patch returns only the fields sent', () => {
  const r = sanitizeVisit({ note: 'x' }, false) as { value: Record<string, unknown> }
  assert.deepEqual(Object.keys(r.value), ['note'])
})

test('mergeTimeline orders newest first and keeps same-day visits', () => {
  const merged = mergeTimeline([entry('a', '2026-11-10'), entry('b', '2026-11-02')], [entry('t', '2026-11-10', { source: 'theatre', createdAt: '2026-11-10T20:00:00Z' })])
  assert.deepEqual(merged.map(e => e.id), ['t', 'a', 'b'])
})

test('mergeTimeline orders a single day night, evening, afternoon, morning, then entries with no time', () => {
  const day = (id: string, timing: TimelineEntry['timing'], createdAt: string, source: TimelineEntry['source'] = 'visit') =>
    entry(id, '2026-11-08', { timing, createdAt, source })
  const merged = mergeTimeline(
    [day('morning', 'morning', '2026-11-08T09:00:00Z'), day('night', 'night', '2026-11-08T08:00:00Z'), day('none-old', null, '2026-11-08T07:00:00Z'), day('evening', 'evening', '2026-11-08T10:00:00Z'), day('afternoon', 'afternoon', '2026-11-08T11:00:00Z')],
    [day('none-new', null, '2026-11-08T12:00:00Z', 'theatre')],
  )
  assert.deepEqual(merged.map(e => e.id), ['night', 'evening', 'afternoon', 'morning', 'none-new', 'none-old'])
})

test('mergeTimeline keeps newer days first whatever the time of day', () => {
  const merged = mergeTimeline([entry('old-night', '2026-11-01', { timing: 'night' }), entry('new-morning', '2026-11-02', { timing: 'morning' })], [])
  assert.deepEqual(merged.map(e => e.id), ['new-morning', 'old-night'])
})

test('mergeTimeline puts two visits at the same time of day newest-logged first', () => {
  const merged = mergeTimeline([entry('a', '2026-11-08', { timing: 'evening', createdAt: '2026-11-08T10:00:00Z' }), entry('b', '2026-11-08', { timing: 'evening', createdAt: '2026-11-08T12:00:00Z' })], [])
  assert.deepEqual(merged.map(e => e.id), ['b', 'a'])
})

test('mergeTimeline drops theatre rows with no place', () => {
  const orphan = entry('o', '2026-11-09', { source: 'theatre', place: { ...place, id: '' } })
  assert.deepEqual(mergeTimeline([], [orphan]), [])
})

test('pageAfter pages without gaps or repeats across a same-day boundary', () => {
  const sorted = mergeTimeline([entry('1', '2026-11-10'), entry('2', '2026-11-08', { createdAt: '2026-11-08T12:00:00Z' }), entry('3', '2026-11-08', { createdAt: '2026-11-08T09:00:00Z' }), entry('4', '2026-11-05'), entry('5', '2026-11-01')], [])
  const first = pageAfter(sorted, null, 2)
  const second = pageAfter(sorted, first.next, 2)
  const third = pageAfter(sorted, second.next, 2)
  assert.deepEqual([...first.items, ...second.items, ...third.items].map(e => e.id), ['1', '2', '3', '4', '5'])
  assert.equal(third.next, null)
  assert.deepEqual(pageAfter(sorted, 'visit:nope', 2).items.map(e => e.id), ['1', '2'])
})

test('groupByMonth groups in order with a readable label', () => {
  const g = groupByMonth([entry('a', '2026-11-10'), entry('b', '2026-11-02'), entry('c', '2026-10-30')])
  assert.deepEqual(g.map(x => [x.month, x.label, x.entries.length]), [['2026-11', 'November 2026', 2], ['2026-10', 'October 2026', 1]])
})

test('placeStats averages only visits with a spend and counts zero', () => {
  const s = placeStats([entry('a', '2026-11-10', { spend: 350 }), entry('b', '2026-11-09', { spend: 0 }), entry('c', '2026-11-08')])
  assert.equal(s.visits, 3)
  assert.equal(s.avgSpend, 175)
})

test('placeStats has no average when nothing has a spend, and handles no visits', () => {
  assert.equal(placeStats([entry('a', '2026-11-10')]).avgSpend, null)
  assert.deepEqual(placeStats([]), { visits: 0, avgSpend: null, usualVibe: null })
})

test('placeStats usual vibe is the most common, ties go to the newest', () => {
  const v = (id: string, d: string, vibe: 'loved' | 'good') => entry(id, d, { vibe })
  assert.equal(placeStats([v('a', '2026-11-10', 'loved'), v('b', '2026-11-09', 'good'), v('c', '2026-11-08', 'good'), v('d', '2026-11-07', 'loved')]).usualVibe, 'loved')
  assert.equal(placeStats([v('a', '2026-11-10', 'good'), v('b', '2026-11-09', 'loved')]).usualVibe, 'good')
})

test('theatreStats ignores logs without a format or vibe', () => {
  const s = theatreStats([{ screen_format: 'imax', theatre_vibe: null }, { screen_format: null, theatre_vibe: null }, { screen_format: 'imax', theatre_vibe: null }, { screen_format: 'barco', theatre_vibe: null }])
  assert.deepEqual(s, { visits: 4, usualFormat: 'imax', usualVibe: null })
})

test('canWishlist only allows unvisited places of a loggable kind', () => {
  assert.equal(canWishlist({ kind: 'cafe' }, 0), true)
  assert.equal(canWishlist({ kind: 'cafe' }, 1), false)
  assert.equal(canWishlist({ kind: 'theatre' }, 0), false)
  assert.equal(canWishlist({ kind: 'spa' }, 0), false)
})

test('visitsNotReady spots a missing table or column only', () => {
  assert.equal(visitsNotReady({ code: '42P01', message: 'relation "place_visits" does not exist' }), true)
  assert.equal(visitsNotReady({ code: '42703', message: 'column places.wishlisted_at does not exist' }), true)
  assert.equal(visitsNotReady({ code: '23505', message: 'duplicate key' }), false)
  assert.equal(visitsNotReady({ code: '42703', message: 'column logs.some_typo does not exist' }), false)
  assert.equal(visitsNotReady({ code: '42P01', message: 'relation "orders" does not exist' }), false)
  assert.equal(visitsNotReady({ message: "Could not find the 'theatre_vibe' column of 'logs' in the schema cache" }), true)
  assert.equal(visitsNotReady({ code: '42703', message: 'column "theatre_timing" of relation "logs" does not exist' }), true)
  assert.equal(visitsNotReady(undefined), false)
})
