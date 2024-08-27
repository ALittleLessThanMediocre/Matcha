const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

// Route to handle verify link in verify email
router.get('/:token', (req, res) => {
    
    var token = req.params.token;
    let errors = [];
    let success = [];
    
    if (!token){
        
        errors.push({ msg: 'No token provided!'});
        res.render('login', {errors});

    }
    else {
        // Generate new token, best practice
        var Token = func.generateToken(32);

        let sql = "SELECT * FROM users WHERE token = ?";
        
        con.query(sql, [token], function(err, result){
            
            if (err) throw err;

            if (!result.length){

                error.push({ msg: 'Invalid token!'});
                res.render('login', {errors});

            } else if (result[0].verified == 'Y') {
                
                errors.push({ msg: 'Account already verified'});
                res.render('login', {errors});

            } else {
                
                let sql1 = "UPDATE users SET verified = ?, token = ? WHERE token = ?";
                
                con.query(sql1, ['Y', Token, token], function(err, result){
                    if (err) throw err;
                    success.push({ msg: 'Account verified ! You can now login'});
                    res.render('login', {success});
                });
            }
        });
    } 
});

module.exports = router;