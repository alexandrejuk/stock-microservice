const lazyLoading = require('.')
const Sequelize = require('sequelize')
const Operators = Sequelize.Op
const moment = require('moment')

const db = new Sequelize('data', 'user', 'passs', {
  dialect: 'postgres', 
})

describe('limit', () => {
  test('should return the default value if total is less or equal to 0', () => {
    const result  = lazyLoading()({
      total: -20,
    })

    expect(result.limit).toEqual(25)
  })

  test('should return the default value if total is greater than 100', () => {
    const result  = lazyLoading()({
      total: 101,
    })

    expect(result.limit).toEqual(25)
  })

  test('should return the total value if it is correct', () => {
    const result  = lazyLoading()({
      total: 100,
    })

    expect(result.limit).toEqual(100)
  })
})

describe('offset', () => {
  test('should return 0 value if page is less than 1', () => {
    const result  = lazyLoading()({
      total: 20,
      page: -1,
    })

    expect(result.offset).toEqual(0)
  })

  test('should return the correct offset if total and page are correct', () => {
    const result  = lazyLoading()({
      total: 20,
      page: 3,
    })

    expect(result.offset).toEqual(40)
  })
})


describe('global search', () => {
  test('should return formatted query containing the passed fields', () => {
    const table1 = db.define('table1', {
      name: Sequelize.STRING,
      motherName: Sequelize.STRING,
    })

    const query = {
      filters: {
        global: {
          fields: ['name', 'motherName'],
          value: 'Mar'
        },
      }
    }

    const { where }  = lazyLoading(table1)(query)
    const orQuery = where[Operators.or]

    expect(orQuery).toBeTruthy()
    expect(orQuery).toEqual({
      name: {
        [Operators.iRegexp]: 'Mar',
      },
      motherName: {
        [Operators.iRegexp]: 'Mar',
      }
    })
  })

  test('should return formatted query containing only the fields available in model', () => {
    const table1 = db.define('table1', {
      name: Sequelize.STRING,
    })

    const query = {
      filters: {
        global: {
          fields: ['name', 'motherName'],
          value: 'Mar'
        },
      }
    }

    const { where }  = lazyLoading(table1)(query)
    const orQuery = where[Operators.or]

    expect(orQuery).toBeTruthy()
    expect(orQuery).toEqual({
      name: {
        [Operators.iRegexp]: 'Mar',
      },
    })
  })

  test('should return an empty object if nothing is passed in fields', () => {
    const table1 = db.define('table1', {
      name: Sequelize.STRING,
    })

    const query = {
      filters: {
        global: {
          fields: [],
          value: 'Mar'
        },
      }
    }

    const { where }  = lazyLoading(table1)(query)
    const orQuery = where[Operators.or]

    expect(orQuery).toBeUndefined()
  })

  test(`should set value equal to '' if not passed`, () => {
    const table1 = db.define('table1', {
      name: Sequelize.STRING,
    })

    const query = {
      filters: {
        global: {
          fields: ['name'],
        },
      }
    }

    const { where }  = lazyLoading(table1)(query)
    const orQuery = where[Operators.or]

    expect(orQuery).toBeTruthy()
    expect(orQuery).toEqual({
      name: {
        [Operators.iRegexp]: ''
      }
    })
  })
})

describe('specific search', () => {
  test('should formatted specific field in the where object ', () => {
    const table1 = db.define('table1', {
      name: Sequelize.STRING,
      birthDay: Sequelize.DATE,
      age: Sequelize.INTEGER
    })

    const query = {
      filters: {
        specific: {
          name: 'Vitor',
          birthDay: {
            start: new Date('05-29-1994'),
            end: new Date('02-28-2019')
          },
          age: 32,
        },
      }
    }

    const { where }  = lazyLoading(table1)(query)

    expect(where).toEqual({
      name: {
        [Operators.iRegexp]: 'Vitor'
      },
      birthDay: {
        [Operators.gte]: moment('05-29-1994', "MM-DD-YYYY").startOf('day').toString(),
        [Operators.lte]: moment('02-28-2019', "MM-DD-YYYY").endOf('day').toString(),
      },
      age: {
        [Operators.eq]: 32,
      }
    })
  })

  test('should return date if start if only started was passed', () => {
    const table1 = db.define('table1', {
      name: Sequelize.STRING,
      birthDay: Sequelize.DATE,
    })

    const query = {
      filters: {
        specific: {
          name: 'Vitor',
          birthDay: {
            start: new Date('05-29-1994').toISOString(),
          }
        },
      }
    }

    const { where }  = lazyLoading(table1)(query)

    expect(where).toEqual({
      name: {
        [Operators.iRegexp]: 'Vitor'
      },
      birthDay: {
        [Operators.gte]: moment('05-29-1994', "MM-DD-YYYY").startOf('day').toString(),
      },
    })
  })
})

