const R = require('ramda')
const {
  UniqueConstraintError,
  Error: SequelizeError,
  ValidationError
} = require('sequelize')
const { Base } = require('../errors')

const UniqueConstraintErrorFormatter = R.applySpec({
  field: R.propOr(null, 'path'),
  message: R.propOr('must be unique', 'message'),
  type: () => 'unique_violation',
})

const validationErrorFormatter = R.applySpec({
  field: R.pipe(
    R.propOr([], 'field'),
    R.join('.'),
  ),
  message: R.propOr('required', 'message'),
  type: () => 'required',
})

const getError = (
  status = 500,
  name = 'Internal Error',
  formatter,
) => R.applySpec({
  status: R.propOr(status, 'status'),
  name: () => name,
  errors: R.pipe(
    R.propOr([], 'errors'),
    R.map(formatter),
  ),
})

const baseErrorFormatter = R.applySpec({
  field: R.propOr([], 'field'),
  message: R.propOr('required', 'message'),
  type: R.propOr('required'),
})


const formatErrorResponse = (err) => {
  if (err instanceof UniqueConstraintError) {
    return getError(409, 'unique_constraint', UniqueConstraintErrorFormatter)(err)
  }

  if (err instanceof ValidationError) {
    return getError(409, 'validation_error', UniqueConstraintErrorFormatter)(err)
  }

  if (err instanceof SequelizeError) {
    return getError(409, 'general_database', UniqueConstraintErrorFormatter)(err)
  }

  if (err.message === 'validation error') {
    return getError(422, 'validation_error', validationErrorFormatter)(err)
  }

  if (err instanceof Base) {
    return getError(err.statusCode, err.message, baseErrorFormatter)(err)
  }

  return getError()(err)
}

module.exports = formatErrorResponse
