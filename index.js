const parse = require('./lib/parse');
const stringify = require('./lib/stringify');

const JSON = {};
JSON.parse = parse;
JSON.stringify = stringify;

module.exports = JSON;
