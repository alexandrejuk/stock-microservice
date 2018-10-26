const test = require('ava')
const regExp = require('./')

test('should return a new regExp', t => {
  const content = 'Alexandre'
  const createRegExp = regExp(content)
  t.regex(content, createRegExp);
})

test('should be is not a regExp', t => {
  const content = 'Alexandre'
  const createRegExp = regExp(content)
  t.notRegex('Vitor', createRegExp);
})