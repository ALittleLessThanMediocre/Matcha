const mysql = require('mysql');
require('dotenv').config();

const con = mysql.createConnection({
	host	: process.env.HOST,
	user	: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE
});

con.connect(function(err){
	if (err) throw err;
});

module.exports = con;