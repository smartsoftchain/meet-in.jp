var mysql = require('mysql');
config = require('./config');  //configの読み込み

var pool = mysql.createPool(config.databasePool);

module.exports = pool;
