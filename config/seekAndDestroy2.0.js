var mysql = require('mysql');
require('dotenv').config();

var destroy = 'dchappie@mailinator.com';

var con = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE
});

var sql = "DELETE FROM users WHERE email = ?";

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");
	con.query(sql, destroy, function (err, result) {
		if (err) throw err;
		console.log("Target Destroyed!");
		con.end(function (err) {
			if (err) throw err;
			console.log("Disconnected...");
		});
	});
});
