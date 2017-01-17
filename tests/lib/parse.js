const test = require('tape');
const JSON = require('../..');

test('parse', (t) => {
  t.equal(JSON.parse(), 'parse');
  t.end();
});
