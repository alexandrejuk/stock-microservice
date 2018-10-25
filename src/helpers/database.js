const db = require('../db')

const isDatabaseConnected = () => db
  .authenticate()

const forceCreateTables = () =>
  isDatabaseConnected()
  .then(() => db.sync({ force: true }))

module.exports = {
  isDatabaseConnected,
  forceCreateTables
}