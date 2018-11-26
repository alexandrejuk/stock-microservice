const IndividualProductDomain = require('../../domains/IndividualProduct')
const individualProductDomain = new IndividualProductDomain()

const add = async (req, res, next) => {
  try {
    const response = await individualProductDomain.addMany(req.body)
    res.send(response)
  } catch (error) {
    next(error)
  }
}

const get = async (req, res, next) => {
    try {
      const response = await individualProductDomain.getAll()
      res.send(response)
    } catch (error) {
      next(error)
    }
  }

module.exports = {
  add,
  get,
}