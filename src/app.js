const Express = require('express')
const bodyParse = require('body-parser')
const cors = require('cors')
const logger = require('morgan')
const errorFormatter = require('./helpers/errorFormatter')
const productRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const stockRoute = require('./routes/stock')

const app = Express()

/* middlewares */
app.use(bodyParse.json())
app.use(cors())
app.use(logger('dev'))

/* routes */
app.use('/api', productRoute)
app.use('/api', orderRoute)
app.use('/api', stockRoute)

/* error handlers */
app.use((err, req, res, next) => { //eslint-disable-line

  /* eslint-disable no-console */
  console.error(err.stack || err)
  console.error(JSON.stringify(err))
  const formattedError = errorFormatter(err)

  res.status(formattedError.status || 500)
  res.json(formattedError)
})

app.listen(3003, () => console.log('Running...'))

module.exports = app