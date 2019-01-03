'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('individualProduct', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      serialNumber: {
        type: Sequelize.STRING,
        unique: 'product_serial',
        allowNull: false,
      },
      originId: {
        type: Sequelize.UUID,
      },
      originType: {
        type: Sequelize.STRING,
      },
      available: {
        type: Sequelize.BOOLEAN,
        default: true,
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
        onDelete: 'restrict'
      },
      productId: {
        unique: 'product_serial',
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'product',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
    })
    .then(() => queryInterface.addConstraint('individualProduct', ['productId', 'serialNumber'], {
      type: 'unique',
      name: 'product_serial'
    })),
  down: queryInterface => queryInterface.dropTable('individualProduct'),
}
