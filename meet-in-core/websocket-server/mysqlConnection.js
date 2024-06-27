var mysql = require('mysql');
config = require('./config');  //configの読み込み

var connection = mysql.createConnection(config.databaseAuth);

module.exports = connection;
