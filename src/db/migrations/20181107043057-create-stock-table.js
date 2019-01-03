'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('stock', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      originId: Sequelize.UUID,
      originType: Sequelize.STRING,
      description: Sequelize.STRING,
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
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'product',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      stockLocationId: {
        type: Sequelize.UUID,
        references: {
          model: 'stockLocation',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      }
    }),
  down: queryInterface => queryInterface.dropTable('stock'),
}
