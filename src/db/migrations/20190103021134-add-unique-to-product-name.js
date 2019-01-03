'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('product', ['name'], {
      type: 'unique',
      name: 'product_name_key'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('product', 'product_name_key')
  }
};
