const Express = require('express')
const bodyParse = require('body-parser')
const cors = require('cors')

const app = Express()

app.use(bodyParse.json())
app.use(cors())
app.use('/api', (req, res, next) => res.send('Ola mundo'))

app.listen(3000, () => console.log('Running...'))

module.exports = app