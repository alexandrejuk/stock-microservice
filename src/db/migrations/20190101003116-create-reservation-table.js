'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('reservation', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      description: {
        type: Sequelize.STRING,
      },
      reservedAt: {
        type: Sequelize.DATE,
      },
      releasedAt: {
        type: Sequelize.DATE,
      },
      originId: {
        type: Sequelize.STRING,
      },
      employeeId: {
        type: Sequelize.STRING,
      },
      originType: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM(['reservado', 'liberado']),
        defaultValue: 'reservado',
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
      customerId: {
        type: Sequelize.UUID,
        references: {
          model: 'customer',
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
  down: queryInterface => queryInterface.dropTable('reservation'),
}
