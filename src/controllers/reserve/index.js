const ReservationDomain = require('../../domains/Reservation')
const database = require('../../db')
const reservationDomain = new ReservationDomain()

const add = async (req, res, next) => {
  let transaction = await database.transaction()
  try {
    const response = await reservationDomain.add(req.body, { transaction })

    await transaction.commit()
    res.send(response)
  } catch (error) {
    console.log(error)
    await transaction.rollback()
    next(error)
  }
}

const get = async (req, res, next) => {
  let transaction = await database.transaction()
  try {
    const response = await reservationDomain.getById(
      req.params.id,
      { transaction }
    )

    await transaction.commit()
    res.send(response)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const deleteHistory = async (req, res, next) => {
  let transaction = await database.transaction()
  try {
    await reservationDomain.deleteHistory(
      req.params.id,
      { transaction }
    )

    await transaction.commit()
    res.json({})
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllProducts = async (req, res, next) => {
  try {
    const reservations  = await reservationDomain.getAllProducts(req.params.employeeId)

    res.json(reservations)
  } catch(error) {
    next(error)
  }
}

const updateProductResevation = async (req, res, next) => {
  const productReservation = req.body

  const transaction = await database.transaction()
  try {
    const { type, item, stockLocationId, reservationId } = productReservation

    const response  = type === 'return'
      ? await reservationDomain.returnProduct(item, reservationId, stockLocationId, { transaction})
      : await reservationDomain.releaseProduct(item, reservationId, { transaction })

    await transaction.commit()

    res.json(response)
  } catch(error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const reservations  = await reservationDomain.getAll(req.query)

    res.json(reservations)
  } catch(error) {
    next(error)
  }
}

module.exports = {
  add,
  get,
  getAll,
  getAllProducts,
  updateProductResevation,
  deleteHistory
}