import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchAll, PAGE_SIZE } from './fetch-all.ts'

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i }))

test('fetchAll reads every page, past the 1000-row cap', async () => {
  const all = rows(PAGE_SIZE * 2 + 37)
  const calls: [number, number][] = []
  const { data, error } = await fetchAll<{ id: number }>(async (from, to) => { calls.push([from, to]); return { data: all.slice(from, to + 1), error: null } })
  assert.equal(error, null)
  assert.equal(data!.length, all.length)
  assert.deepEqual(data!.map(r => r.id), all.map(r => r.id))
  assert.equal(calls.length, 3)
})

test('fetchAll stops after a short page and does not ask for another', async () => {
  let calls = 0
  const { data } = await fetchAll<{ id: number }>(async () => { calls++; return { data: rows(5), error: null } })
  assert.equal(data!.length, 5)
  assert.equal(calls, 1)
})

test('fetchAll reads one more page when the data is an exact multiple of the page size', async () => {
  const all = rows(PAGE_SIZE)
  let calls = 0
  const { data } = await fetchAll<{ id: number }>(async (from, to) => { calls++; return { data: all.slice(from, to + 1), error: null } })
  assert.equal(data!.length, PAGE_SIZE)
  assert.equal(calls, 2)
})

test('fetchAll returns the first error and no partial data', async () => {
  let call = 0
  const result = await fetchAll<{ id: number }>(async () => (++call === 1 ? { data: rows(PAGE_SIZE), error: null } : { data: null, error: { message: 'boom', code: 'X' } }))
  assert.equal(result.data, null)
  assert.equal(result.error?.message, 'boom')
})

test('fetchAll treats a null page as empty', async () => {
  const { data, error } = await fetchAll<{ id: number }>(async () => ({ data: null, error: null }))
  assert.equal(error, null)
  assert.deepEqual(data, [])
})
