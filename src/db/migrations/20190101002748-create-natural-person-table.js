'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('naturalPerson', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nickName: {
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
        onDelete: 'restrict'
      },
    }),
  down: queryInterface => queryInterface.dropTable('naturalPerson'),
}
