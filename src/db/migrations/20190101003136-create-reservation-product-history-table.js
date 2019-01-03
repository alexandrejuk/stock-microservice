'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('reservationProductHistory', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM(['release', 'return', 'cancel']),
        allowNull: true,
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
      reservationProductId: {
        type: Sequelize.UUID,
        references: {
          model: 'reservationProduct',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
    }),
  down: queryInterface => queryInterface.dropTable('reservationProductHistory'),
}
