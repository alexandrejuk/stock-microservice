'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('order', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      description: {
        type: Sequelize.STRING,
      },
      reason: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM(['CANCELLED', 'REGISTERED']),
        defaultValue: 'REGISTERED',
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
      stockLocationId: {
        type: Sequelize.UUID,
        references: {
          model: 'stockLocation',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    }),
  down: queryInterface => queryInterface.dropTable('order'),
}
