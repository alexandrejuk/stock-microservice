require('../src/helpers/loadenv')
const databaseHelper = require('../src/helpers/database')

const setupJest = async () => {
  await databaseHelper.isDatabaseConnected()
}

module.exports = setupJest