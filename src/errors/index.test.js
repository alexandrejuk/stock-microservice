const expect = require('expect');
const { Base, ValidationError } = require('./')

test('should be a istance validation error', () => {
  const istanceValidationError = new ValidationError()
  expect(istanceValidationError instanceof ValidationError).toBe(true)
})

test('should be not a istance validation error', () => {
  const istanceValidationError = ValidationError
  expect(istanceValidationError instanceof ValidationError).toBe(false)
})

test('should be a istance base', () => {
  const istanceBase = new Base()
  expect(istanceBase instanceof Base).toBe(true)
})

test('should be not a istance base', () => {
  const istanceBase = Base
  expect(istanceBase instanceof Base).toBe(false)
})