require('./helpers/loadenv')
const Express = require('express')
const bodyParse = require('body-parser')
const cors = require('cors')
const logger = require('morgan')
const authorizationMiddleware = require('photon-authorization-middleware')
const errorFormatter = require('./helpers/errorFormatter')
const productRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const stockRoute = require('./routes/stock')
const stockLocationRoute = require('./routes/stockLocation')
const reservationRoute = require('./routes/reservation')
const individualProductsRoute = require('./routes/individualProduct')
const customerRoute = require('./routes/customer')
const callRoute = require('./routes/call')
const technicalRoute = require('./routes/technical')
const databaseHelper = require('./helpers/database')
const rolesMiddleware = require('./middleware/roles')

const app = Express()

/* middlewares */
app.use(bodyParse.urlencoded({ extended: true }))
app.use(bodyParse.json())
app.use(cors())
app.use(logger('dev'))

app.use('/api', authorizationMiddleware(process.env.NODE_ENV !== 'production', '165.227.78.113', 3000))
app.use('/api', rolesMiddleware(['all']))

/* routes */
app.use('/api', productRoute)
app.use('/api', customerRoute)
app.use('/api', orderRoute)
app.use('/api', stockRoute)
app.use('/api', stockLocationRoute)
app.use('/api', reservationRoute)
app.use('/api', individualProductsRoute)
app.use('/api', callRoute)
app.use('/api', technicalRoute)

/* error handlers */
app.use((err, req, res, next) => { //eslint-disable-line

  /* eslint-disable no-console */
  console.error(err.stack || err)
  console.error(JSON.stringify(err))
  const formattedError = errorFormatter(err)

  res.status(formattedError.status || 500)
  res.json(formattedError)
})

const port = process.env.PORT || 3003
databaseHelper
  .isDatabaseConnected()
  .then(() => {
    app.listen(port, () => console.log(`Running on ${port}`))
  })
  .catch(error => console.log(error))


module.exports = app