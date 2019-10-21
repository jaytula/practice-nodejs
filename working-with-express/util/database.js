const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'example', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
