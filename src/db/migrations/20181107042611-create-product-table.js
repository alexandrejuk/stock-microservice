'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('product', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    },
    brand: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sku: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    hasSerialNumber: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    priceBuy: {
      type: Sequelize.INTEGER,
      default: 0,
    },
    priceSell: {
      type: Sequelize.INTEGER,
      default: 0,
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
  }),
  down: queryInterface => queryInterface.dropTable('product'),
}
