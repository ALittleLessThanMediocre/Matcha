var mysql = require('mysql');
require('dotenv').config();

var con = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD
});

var sql = "DROP DATABASE IF EXISTS matcha";

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");
	con.query(sql, function (err, result) {
		if (err) throw err;
		if (result.warningCount == 0)
			console.log("Database Dropped!");
		con.end(function (err) {
			if (err) throw err;
			console.log("Disconnected...");
		})
	})
})