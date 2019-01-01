const IndividualProductDomain = require('../../domains/IndividualProduct')
const individualProductDomain = new IndividualProductDomain()

const get = async (req, res, next) => {
  try {
    const response = await individualProductDomain.getAll()
    res.send(response)
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const response = await individualProductDomain.getById(id)
    res.send(response)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { id } = req.params
    const response = await individualProductDomain.updateById(id, req.body.serialNumber)
    res.send(response)
  } catch (error) {
    next(error)
  }
} 

module.exports = {
  get,
  getById,
  update,
}