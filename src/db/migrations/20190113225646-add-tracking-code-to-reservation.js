'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('reservation', 'trackingCode', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
  down: queryInterface => queryInterface.removeColumn('reservation', 'trackingCode'),
}
