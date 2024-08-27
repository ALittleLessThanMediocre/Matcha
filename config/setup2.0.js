var mysql = require('mysql');
require('dotenv').config();

var con = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD
});

var con1 = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE
});

var sql0 = "CREATE DATABASE IF NOT EXISTS matcha";

var sql1 = "CREATE TABLE IF NOT EXISTS users (\
					`id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,\
					`userName` VARCHAR(255),\
					`firstName` VARCHAR(255),\
					`lastName` VARCHAR(255),\
					`email` VARCHAR(255),\
					`password` BINARY(60),\
					`verified` CHAR(1),\
					`token` VARCHAR(32),\
					`viewToken` VARCHAR(32),\
					`gender` VARCHAR(6),\
					`sexualOrientation` VARCHAR(5),\
					`dateOfBirth` DATE,\
					`age` INT,\
					`bio` VARCHAR(10000),\
					`interest1` VARCHAR(12),\
					`interest2` VARCHAR(12),\
					`interest3` VARCHAR(12),\
					`interest4` VARCHAR(12),\
					`city` VARCHAR(255),\
					`lat` FLOAT,\
					`lng` FLOAT,\
					`popularity` INT(2),\
					`profilePicture` VARCHAR(255),\
					`pic1` VARCHAR(255),\
					`pic2` VARCHAR(255),\
					`pic3` VARCHAR(255),\
					`pic4` VARCHAR(255),\
					`online` CHAR(1),\
					`lastOn` DATETIME,\
					`suspended` INT(1),\
					`extProfComp` INT(1)\
					);"

		var sql2 = "CREATE TABLE IF NOT EXISTS blocked (\
					`userId` INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,\
					`userName` VARCHAR(255) NOT NULL,\
					`blocked` VARCHAR(255) NOT NULL,\
					`date` DATETIME NOT NULL,\
					`processed` INT DEFAULT '0'\
					);"

		var sql3 = "CREATE TABLE IF NOT EXISTS likes (\
					`userId` INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,\
					`userName` VARCHAR(255) NOT NULL,\
					`liked` VARCHAR(255) NOT NULL\
					);"

		var sql4 = "CREATE TABLE IF NOT EXISTS profileViews (\
					`userId` INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,\
					`userName` VARCHAR(255) NOT NULL,\
					`viewed` VARCHAR(255) NOT NULL,\
					`date` DATETIME\
					);"

		var sql5 = "CREATE TABLE IF NOT EXISTS reports (\
					`id` INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,\
					`complainant` VARCHAR(255) NOT NULL,\
					`complaintAbout` VARCHAR(255) NOT NULL,\
					`subject` VARCHAR(255) NOT NULL,\
					`text` MEDIUMTEXT NOT NULL,\
					`processed` INT DEFAULT '0'\
					);"

		var sql6 = "CREATE TABLE IF NOT EXISTS chats(\
					`id` INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,\
					`sender` VARCHAR(255) NOT NULL,\
					`receiver` VARCHAR(255) NOT NULL,\
					`message` VARCHAR(10000) NOT NULL,\
					`date` VARCHAR(255)\
					);"

// ARROW CODE AHEAD BEWARE !!!

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected to MySQL!");
	con.query(sql0, function (err, result) {
		if (err) throw err;
		console.log("Database matcha created!");
		con1.connect(function (err) {
			if (err) throw err;
			console.log("Connected to Database matcha!");
			con1.query(sql1, function (err, result) {
				if (err) throw err;
				console.log("users table created!");
				con1.query(sql2, function (err, result) {
				if (err) throw err;
				console.log("blocked table created!");
					con1.query(sql3, function (err, result) {
					if (err) throw err;
					console.log("likes table created!");
						con1.query(sql4, function (err, result) {
						if (err) throw err;
						console.log("profileViews table created!");
							con1.query(sql5, function (err, result){
								if (err) throw err;
								console.log("reports table created!");
								con1.query(sql6, function (err, result){
									if (err) throw err;
									console.log("chats table created!");
									con1.end(function (err) {
										if (err) throw err;
										console.log("Disconnected from Database matcha...");
										con.end(function (err) {
											if (err) throw err;
											console.log("Disconnected from MySQL...");
										});
									})
								});
							})
						});
					});
				});
			});
		});
	});
});