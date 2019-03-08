const Sequelize = require('sequelize')
const R = require('ramda')
const Operators = Sequelize.Op
const moment = require('moment')
const database = require('../../db')

const MINIMUM_LIMIT = 25
const MAXIMUM_LIMIT = 100
const DEFAULT_PAGE = 1

const isTotalNotAllowed = (value) => (value <= 0 || value > MAXIMUM_LIMIT)
const getLimit = R.pipe(
  R.propOr(MINIMUM_LIMIT, 'total'),
  R.ifElse(
    isTotalNotAllowed,
    R.always(MINIMUM_LIMIT),
    R.identity,
  )
)

const isPageIncorrect = page => page < 1
const getPage = R.pipe(
  R.propOr(0, 'page'),
  Number.parseInt,
  R.ifElse(
    isPageIncorrect,
    R.always(DEFAULT_PAGE),
    R.identity
  )
)

const calcOffset = (limit, page) => limit * (page - 1)
const getFiltersForModel = (modelName, query) => {
  return R.pathOr({}, ['filters', modelName], query)
}

const getModelAttributes = R.propOr({}, 'attributes')
const isNested = prop => prop && prop.includes('$')
const getGlobalFields = R.pathOr([], ['global', 'fields'])
const getGlobalValue = R.pathOr('', ['global', 'value'])

const getValueAccordingToValue = (fieldType, value) => {
  if (
    fieldType instanceof Sequelize.STRING
    || fieldType instanceof Sequelize.ENUM
  ) {
    return {
      [Operators.iRegexp]: value
    }
  }

  if (fieldType instanceof Sequelize.DATE) {
    const start = R.pipe(
      R.propOr(null, 'start'),
      R.ifElse(
        Boolean,
        date => moment(date).startOf('day').toString(),
        R.identity,
      )
    )(value)

    const end = R.pipe(
      R.propOr(null, 'end'),
      R.ifElse(
        Boolean,
        date => moment(date).endOf('day').toString(),
        R.identity,
      )
    )(value)

    return {
      ...start && { [Operators.gte]: start },
      ...end && { [Operators.lte]: end },
    }
  }

  if (
    fieldType instanceof Sequelize.INTEGER
    || fieldType instanceof Sequelize.NUMBER
    || fieldType instanceof Sequelize.NUMERIC
  ) {
    return { [Operators.eq]: value }
  }
  
  return {}
}
const getFieldType = (modelAttributes, fieldName) => {
  return R.path([fieldName, 'type'], modelAttributes)
}

const getNestedAttributeType = (model, associationName, attributeName) => R.path(
  [
    'associations',
    associationName,
    'target',
    'attributes',
    attributeName,
    'type',
  ],
  model
)


const getGlobalSearch = (model, filters) => {
  const modelAttributes = getModelAttributes(model)
  const fields = getGlobalFields(filters)
  const value = getGlobalValue(filters)
  
  const result = fields.reduce((previous, fieldName) => {
    let fieldType = null

    if (isNested(fieldName)) {
      const keyWithoutDolarSign = fieldName.replace(/\$/g, '')
      const keys = keyWithoutDolarSign.split('.')
      if (keys.length !== 2) {
        throw new Error('query not supported')
      }

      const [associationName, attributeName] = keys
      fieldType = getNestedAttributeType(model, associationName, attributeName)
    } else {
      fieldType = getFieldType(modelAttributes, fieldName)
    }
    
    if(!fieldType){
      return previous
    }

    const fieldSearch = getValueAccordingToValue(fieldType, value)
    return {
      ...previous,
      [fieldName]: fieldSearch
    }
  }, {})

  return result
}

const getSpecificFields = R.pathOr([], ['specific'])

const getSpecificSearch = (model, filters) => {
  const modelAttributes = getModelAttributes(model)
  const fields = getSpecificFields(filters)
  
  return Object.keys(fields)
    .reduce((previous, fieldName) => {
      let fieldType = null
  
      if (isNested(fieldName)) {
        const keyWithoutDolarSign = fieldName.replace(/\$/g, '')
        const keys = keyWithoutDolarSign.split('.')
        if (keys.length !== 2) {
          throw new Error('query not supported')
        }
  
        const [associationName, attributeName] = keys
        fieldType = getNestedAttributeType(model, associationName, attributeName)
      } else {
        fieldType = getFieldType(modelAttributes, fieldName)
      }

      if(!fieldType){
        return previous
      }
      const value = fields[fieldName]
      const fieldSearch = getValueAccordingToValue(fieldType, value)

      return {
        ...previous,
        [fieldName]: fieldSearch
      }
    }, {})
}



const getLazyLoading = (query = {}) => {
  const limit = getLimit(query)
  const page = getPage(query)
  const offset = calcOffset(limit, page)

  const getWhereForModel = (modelName) => {
    const model = database.model(modelName)
    const filters = getFiltersForModel(modelName, query)

    const globalSearch = getGlobalSearch(model, filters)
    const specificSearch = getSpecificSearch(model, filters)
  
    return {
      ...!R.isEmpty(globalSearch) && { [Operators.or]: globalSearch },
      ...specificSearch,
    }
  }

  return {
    limit,
    offset,
    getWhereForModel,
  }
}

module.exports = getLazyLoading
