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

module.exports = {
  add,
  get,
}