const test = require('ava')
const { Base, ValidationError } = require('./')

test('should be a istance validation error', t => {
  const istanceValidationError = new ValidationError()
  t.true(istanceValidationError instanceof ValidationError)
})

test('should be not a istance validation error', t => {
  const istanceValidationError = ValidationError
  t.false(istanceValidationError instanceof ValidationError)
})

test('should be a istance base', t => {
  const istanceBase = new Base()
  t.true(istanceBase instanceof Base)
})

test('should be not a istance base', t => {
  const istanceBase = Base
  t.false(istanceBase instanceof Base)
})