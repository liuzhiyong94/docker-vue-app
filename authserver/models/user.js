const db = require('../libs/db');
const Sequelize = require('sequelize');
const User = db.define('user',{
    id: {
        type: Sequelize.INTEGER,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
      },
      username: Sequelize.STRING,
      password: Sequelize.STRING,
});
module.exports=User;