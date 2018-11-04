const databaseHelper = require('../src/helpers/database')

const setupJest = async () => {
  await databaseHelper.dropAndDisconnectDatabase()
}

module.exports = setupJest
