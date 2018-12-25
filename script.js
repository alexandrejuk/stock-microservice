const database = require('./src/db')

const Sequelize = require('sequelize')
const ProductModel = database.model('product')
const StockModel = database.model('stock')
const StockLocationModel = database.model('stockLocation')


async function oi () {
  try {
    const products = await StockModel
    .findAll({
      attributes: ['stockLocationId', [Sequelize.fn('SUM', Sequelize.col('quantity')), 'quantity']],
      include: [
        {
          model: StockLocationModel,
          attributes: ['name'],
        },
      ],
      group: ['stockLocationId', 'productId', 'stockLocation.id']
    })

    console.log(JSON.stringify(products))
  } catch (error) {
    console.log(error)
  }


}

oi()