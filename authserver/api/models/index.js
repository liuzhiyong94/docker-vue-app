
// const fs = require('fs');
// let files = fs.readdirSync(__dirname+'/');
// let js_files = files.filter((f)=>{
//     return f.endsWith('.js');
// }, files);
// module.exports = {};

// for (let f of js_files) {
//     console.log(`import model from file ${f}...`);
//     let name = f.substring(0, f.length - 3);
//     console.log(__dirname+'/'  + f);
//     if(name!='index') module.exports[name] = require(__dirname+'/'  + f);
// }
const sequelize = require('../libs/db');
const Sequelize = require('sequelize');
class User extends Model {}
User.init({
  id: Sequelize.INTEGER
}, { sequelize, modelName: 'dfusers' });

