const test = require('tape')
const { stringifyJSON } = require('../..')
const { stringifiableObjects, unstringifiableValues } = require('../fixtures')

test('stringifyJSON: valid data', (t) => {
  stringifiableObjects.forEach((obj) => {
    const expected = JSON.stringify(obj)
    const actual = stringifyJSON(obj)
    t.deepEqual(actual, expected)
  })

  t.end()
})

test('stringifyJSON: invalid data', (t) => {
  unstringifiableValues.forEach((value) => {
    const expected = JSON.stringify(value)
    const actual = stringifyJSON(value)
    t.deepEqual(actual, expected)
  })

  t.end()
})
