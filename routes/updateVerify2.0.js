const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

// Route to handle link from update verify email
router.get('/:token/:email', (req, res) => {
    var token = req.params.token;
    var email = req.params.email;
    let errors = [];
    let success = [];
   

    if (!token){
        
        errors.push({ msg: 'No token provided!'});
        res.render('login', {errors})
    }
    else {
         // Generate new token, best practice
        var Token = func.generateToken(32);

        const sql = "SELECT * FROM users WHERE token = ?";

        con.query(sql, [token], function(err, result){
            if (err) throw err;

            if (!result.length){
                errors.push({ msg: 'Invalid token!'});
                res.render('login', {errors});
            }
            else {
                const sql1 = "UPDATE users SET email = ? WHERE token = ?";
                con.query(sql1, [email, token], function(err, result){
                    if (err) throw err;
                    const sql2 = "UPDATE users SET token = ? WHERE token = ?";
                    con.query(sql2, [Token, token], function(err, result){
                        if (err) throw err;
                        success.push({ msg: 'Account verified ! You can now login'});
                        res.render('login', {success});
                    });
                });
            }
        });
    } 
});

module.exports = router;