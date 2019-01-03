'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('individualProduct', 'customerId', {
      type: Sequelize.UUID,
      references: {
        model: 'customer',
        key: 'id'
      },
      allowNull: true,
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
  down: queryInterface => queryInterface.removeColumn('individualProduct', 'customerId'),
}
