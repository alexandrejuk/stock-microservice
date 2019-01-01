'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('legalPerson', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      legalName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      inscricaoEstadual: {
        type: Sequelize.STRING,
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
      customerId: {
        type: Sequelize.UUID,
        references: {
          model: 'customer',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
    }),
  down: queryInterface => queryInterface.dropTable('legalPerson'),
}
