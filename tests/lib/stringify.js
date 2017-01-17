const test = require('tape');
const JSON = require('../..');

test('stringify', (t) => {
  t.equal(JSON.stringify(), 'stringify');
  t.end();
});
