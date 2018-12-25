const database = require('./src/db')
const Sequelize = require('sequelize')

const StockModel = database.define('stock', {
  quantity: Sequelize.INTEGER,
  stockable: Sequelize.STRING,
  stockableId: Sequelize.INTEGER,
  description: Sequelize.STRING
})

const OrderModel = database.define('order', {
  description: Sequelize.STRING
})


// StockModel.belongsTo(OrderModel, {
//   constraints: false,
//   foreignKey: 'stockableId',
//   as: 'stock'
// })

OrderModel.hasMany(StockModel, {
  constraints: false,
  foreignKey: 'stockableId',
  scope: {
    stockable: 'order'
  }
})


const dbFlow = async () => {
  await database.sync({ force: true })

  const order = await OrderModel.create({  description: 'oi' })

  await order.createStock({ quantity: 10, description: 'order registration' })

  await order.createStock({ quantity: -10, description: 'order cancellation' })

  // await order.setStocks([])

  await order.reload({ include: [{ all: true }] })
}

dbFlow()