const stringifyJSON = function stringifyJSON(obj) {
  const result = []

  if (obj instanceof Function || obj === undefined) {
    return undefined
  }

  if (obj === null) {
    return 'null'
  }

  if (typeof obj === 'string') {
    return `"${obj}"`
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj.toString()
  }

  if (obj instanceof Array) {
    obj.forEach((item) => {
      let value = stringifyJSON(item)

      if (value === undefined) {
        value = 'null'
      }

      result.push(value)
    })
    return `[${result.join(',')}]`
  }

  Object.keys(obj).forEach((key) => {
    const value = stringifyJSON(obj[key])

    if (value !== undefined) {
      result.push(`${stringifyJSON(key)}:${value}`)
    }
  })

  return `{${result.join(',')}}`
}

module.exports = stringifyJSON
