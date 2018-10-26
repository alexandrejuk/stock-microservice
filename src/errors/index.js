class Base extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
    Error.captureStackTrace(this, this.constructor)
  }
}

class ValidationError extends Base {
  constructor() {
    super('ValidationError', 422)
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = {
  ValidationError,
  Base,
}
