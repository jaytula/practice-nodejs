// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     }
// });

class Order {
  constructor(items) {
    this.items = items;
  }
}

module.exports = Order;
