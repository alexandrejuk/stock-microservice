const OrderDomain = require('../../domains/Order')
const database = require('../../db')
const orderDomain = new OrderDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const response = await orderDomain.add(req.body)

    await transaction.commit()
    res.send(response)
  } catch (error) {
    await transaction.rollback()
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
  const transaction = await database.transaction()
  try {
    const { id } = req.params
    await orderDomain.cancell(id)
    const order = await orderDomain.getById(id)

    await transaction.commit()
    res.status(200).json(order)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const addSerialNumbers = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { orderId, orderProductId } = req.params
    const serialNumbers = req.body

    const inidividualProducts = await orderDomain.addIndividualProducts(
      orderId,
      orderProductId,
      serialNumbers,
      { transaction }
    )
    
    await transaction.commit()
    res.status(200).json(inidividualProducts)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}


module.exports = {
  add,
  get,
  getById,
  updateById,
  addSerialNumbers,
}