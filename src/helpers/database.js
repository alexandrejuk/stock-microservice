const db = require('../db')

const isDatabaseConnected = () => db
  .authenticate()

const forceCreateTables = () =>
  isDatabaseConnected()
  .then(() => db.sync({ sync: true }))

module.exports = {
  isDatabaseConnected,
  forceCreateTables
}