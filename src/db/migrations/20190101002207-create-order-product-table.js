'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('orderProduct', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      quantity: Sequelize.INTEGER,
      unregisteredQuantity: {
        type: Sequelize.INTEGER,
        default: 0,
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
      orderId: {
        type: Sequelize.UUID,
        references: {
          model: 'order',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'product',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      }
    }),
  down: queryInterface => queryInterface.dropTable('orderProduct'),
}
