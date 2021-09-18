const test = require('tape')
const { parseJSON } = require('../..')
const { parseableStrings, unparseableStrings } = require('../fixtures')

test('parseJSON: valid data', (t) => {
  parseableStrings.forEach((str) => {
    const expected = JSON.parse(str)
    const actual = parseJSON(str)

    t.deepEqual(actual, expected)
  })

  t.end()
})

// using t.throws: http://stackoverflow.com/a/34142987/6193423
test('parseJSON: invalid data', (t) => {
  unparseableStrings.forEach((str) => {
    t.throws(() => parseJSON(str), SyntaxError)
  })

  t.end()
})
