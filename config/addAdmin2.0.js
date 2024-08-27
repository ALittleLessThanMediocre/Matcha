var mysql = require('mysql');
require('dotenv').config();
const bcrypt = require('bcrypt');

let con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

let sql = "INSERT INTO users (userName, email, password, verified, extProfComp) VALUES ?;";

let values = [
    ['EmperorOfTheIntaWebs', 'admin@matcha.com', bcrypt.hashSync("123456Admin", 10), 'Y', 1]
]

let email = 'admin@matcha.com';
let find = "SELECT * FROM users WHERE email = ?";

setTimeout(function(){
    con.connect(function (err){
    if (err) console.log("Fault 1");
        console.log("Connected to Database!");
        con.query(find, email, function (err, result){
            if (!result.length) {
                con.query(sql, [values], function (err){
                    if (err) throw err;
                    console.log("Admin Successfully Added to user table!");
                    con.end(function (err){
                        console.log("Disconnecting...");
                    });
                });
            } else {
                console.log("Admin already exists! There can only be ONE!");
                con.end(function (err){
                    console.log("Disconnecting...");
                });
            };
        });
    });
}, 100);