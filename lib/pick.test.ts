import test from 'node:test'
import assert from 'node:assert/strict'
import { pickFields, omitFields } from './pick.ts'

test('pickFields keeps only the listed fields that were sent', () => {
  assert.deepEqual(pickFields({ price: 10, id: 'x', stock_qty: 3, extra: 1 }, ['price', 'stock_qty', 'size']), { price: 10, stock_qty: 3 })
})

test('pickFields keeps a field that is sent as null or 0', () => {
  assert.deepEqual(pickFields({ price: 0, size: null }, ['price', 'size']), { price: 0, size: null })
})

test('pickFields and omitFields return nothing for a body that is not an object', () => {
  for (const bad of [null, undefined, 'text', 5]) {
    assert.deepEqual(pickFields(bad, ['a']), {})
    assert.deepEqual(omitFields(bad, ['a']), {})
  }
})

test('omitFields drops the identity columns and keeps everything else', () => {
  assert.deepEqual(omitFields({ id: '1', created_at: 'now', title: 'Heat', rating: 5 }, ['id', 'created_at']), { title: 'Heat', rating: 5 })
})
