module.exports = (jsonStr) => {
  let src

  function arr() {
    const result = []

    next() // dump '['

    let ch = peek()

    if (ch !== ']') {
      result.push(val())

      ch = peek()
      while (ch === ',') {
        next() // dump ','
        result.push(val())
        ch = peek()
      }
    }

    if (ch === ']') {
      next() // dump ']'
      return result
    }
    throw new SyntaxError(`Invalid char '${ch}'. Expected ']'.`)
  }

  function obj() {
    function pair() {
      let ch = peek()

      if (ch !== '"') {
        throw new SyntaxError(`Invalid char '${ch}'. Expected '"'`)
      }

      const prop = str()
      ch = next()

      if (ch !== ':') {
        throw new SyntaxError(`Invalid char '${ch}'. Expected ':'`)
      }
      result[prop] = val()
    }

    // obj() - begin
    const result = {}
    next() // dump '{'

    let ch = peek()

    if (ch !== '}') {
      pair()

      ch = peek()
      while (ch === ',') {
        next()
        pair()
        ch = peek()
      }
    }

    if (ch === '}') {
      next() // dump '}'
      return result
    }
    throw new SyntaxError(`Invalid char '${ch}'. Expected '}'.`)
  }

  function str() {
    function isHex(ch) {
      return ch.search(/[0-9a-fA-F]/g) !== -1
    }

    function isControlChar(ch) {
      const cp = ch.codePointAt(0)
      return (cp >= 0 && cp <= 31) || (cp >= 127 && cp <= 159)
    }

    // validate `ch` is JSON acceptable unicode
    function unicode(ch = next({ skip: false })) {
      if (!isControlChar(ch)) {
        return ch
      }
      throw new SyntaxError('Invalid control char')
    }

    // build a valid JSON unicode number from 4 chars
    function makeUnicode() {
      const unicodeStr = src
        .splice(0, 4)
        .map((ch) => {
          if (isHex(ch)) {
            return ch
          }
          throw new SyntaxError(`Invalid char ${ch}. Expected [0-9a-fA-F].`)
        })
        .join('')

      return unicode(String.fromCharCode(parseInt(unicodeStr, 16)))
    }

    function escaped() {
      next() // dump '\'
      let ch = peek()

      switch (ch) {
        case '"':
          ch = '"'
          next()
          break
        case '\\':
          ch = '\\'
          next()
          break
        case '/':
          ch = '/'
          next()
          break
        case 'b':
          ch = '\b'
          next()
          break
        case 'f':
          ch = '\f'
          next()
          break
        case 'n':
          ch = '\n'
          next()
          break
        case 'r':
          ch = '\r'
          next()
          break
        case 't':
          ch = '\t'
          next()
          break
        case 'u':
          next() // dump 'u'. next 4 chars must be hex values
          ch = unicode(makeUnicode())
          break
        default:
          throw new SyntaxError(`Invalid char ${ch}. Expected ["\/bfnrtu].`)
      }
      return ch
    }

    // str() - begin
    next() // dump '"'
    let result = ''
    let ch = peek({ skip: false })

    while (ch !== null && ch !== '"') {
      if (ch === '\\') {
        result += escaped()
      } else {
        result += unicode()
      }
      ch = peek({ skip: false })
    }

    if (ch === '"') {
      next() // dump '"'
      return result
    }
    throw new SyntaxError('Invalid string format. Expected """')
  }

  function num() {
    function digits() {
      let result = ''
      let ch = peek()

      while (ch !== null && ch >= 0 && ch <= 9) {
        ch = next()
        result += ch
        ch = peek()
      }
      return result
    }

    function integer() {
      const ch = next()
      const result = ch

      if (ch === '0') {
        return result
      }

      if (ch >= 1 && ch <= 9) {
        return result + digits()
      }
      throw new SyntaxError(`Invalid char '${ch}'. Expected: [0-9].`)
    }

    function fractional() {
      let result = ''

      if (peek() === '.') {
        result = next() + digits()
      }
      return result
    }

    function exponent() {
      let ch = peek()
      let result = ''

      if (ch === 'e' || ch === 'E') {
        result += next()
        ch = peek()

        if (ch === '+' || ch === '-') {
          result += next()
        }
        result += digits()
      }
      return result
    }

    // num() - begin
    const ch = peek()
    let result = ''

    if (ch === '-') {
      result = next()
    }
    return parseFloat(result + integer() + fractional() + exponent(), 10)
  }

  function nul() {
    const value = src.splice(0, 4).join('')

    if (value === 'null') {
      return null
    }
    throw new SyntaxError(`Invalid char ${value}. Expected [null].`)
  }

  function bool(bStr) {
    const value = src.splice(0, bStr.length).join('')

    if (value === bStr) {
      return value === 'true'
    }
    throw new SyntaxError(`Invalid char '${value}'. Expected [true|false].`)
  }

  function val() {
    const ch = peek()

    switch (ch) {
      case '[':
        return arr()
      case '{':
        return obj()
      case '"':
        return str()
      case '-':
        return num()
      case 'n':
        return nul()
      case 't':
        return bool('true')
      case 'f':
        return bool('false')
      default:
        if (ch !== null && ch >= 0 && ch <= 9) {
          return num()
        }
        throw new SyntaxError(`Unexpected char '${ch}'`)
    }
  }

  /**
   * Removes leading whitespace from `src`.
   */
  function ws() {
    function isWhiteSpace(ch) {
      return ch.search(/\s/g) !== -1
    }

    while (src.length && isWhiteSpace(src[0])) {
      src.shift()
    }
  }

  /**
   * A convenience function to consume the next character to process.
   * @param  {Boolean}       options.adv  Set to true to remove current char for
   *                                      processing (default). False keeps char.
   * @param  {Object}        options.skip Set true to skip whitespace(default)
   * @return {String | null}              Return the first character in `src`.
   *                                      If `skip` is false, will return
   *                                      the first character, whitepace or not.
   *                                      If `src` is empty, returns null.
   */
  function next({ adv = true, skip = true } = {}) {
    if (skip) {
      ws()
    }
    return src.length ? (adv ? src.shift() : src[0]) : null
  }

  /**
   * A convenience function to just LOOK at the next character to process.
   * See `next()` for details
   */
  function peek({ skip = true } = {}) {
    return next({ adv: false, skip })
  }

  /**
   * parseJSON
   */
  if (jsonStr === null) {
    return null
  }

  src = jsonStr.toString().trim().split('')

  // start the parsing!
  const result = val()

  // parsing all done. `src` should be 100% consumed.
  if (!src.length) {
    return result
  }

  throw new SyntaxError(`Invalid char '${peek()}'. Expected end of input.`)
}
