const OrderDomain = require('../../domains/Order')
const orderDomain = new OrderDomain()

const add = async (req, res, next) => {
  try {
    const response = await orderDomain.add(req.body)
    res.send(response)
  } catch (error) {
    next(error)
  }
}

const get = async (req, res, next) => {
  try {
    const orders = await orderDomain.getAll()
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const order = await orderDomain.getById(id)
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

const updateById = async (req, res, next) => {
  try {
    const { id } = req.params
    const order = await orderDomain.cancell(id)
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}


module.exports = {
  add,
  get,
  getById,
  updateById,
}