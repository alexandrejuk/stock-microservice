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

module.exports = {
  add,
}