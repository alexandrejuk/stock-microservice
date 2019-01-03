'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('reservationProduct', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      currentQuantity: {
        type: Sequelize.INTEGER,
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
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'product',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      individualProductId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'individualProduct',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      reservationId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'reservation',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      }
    }),
  down: queryInterface => queryInterface.dropTable('reservationProduct'),
}
