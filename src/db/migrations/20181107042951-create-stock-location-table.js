const uuid = require('uuid/v4')

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('stockLocation', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  }).then(() => {
    return queryInterface.bulkInsert(
      'stockLocation',
      [
        {
          id: uuid(),
          name: 'REALPONTO',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'NOVAREAL',
          id: uuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'REALPONTO',
          id: uuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      {}
    )
  }),
  down: queryInterface => queryInterface.dropTable('stockLocation'),
}
