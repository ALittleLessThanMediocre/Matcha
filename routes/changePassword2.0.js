const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const con = require('../config/connect2.0');
const func = require('../functions2.0');

// Change Password GET Handle
router.get('/:token', (req, res) => {
    
    let token = req.params.token;
    let errors = [];

    if (session.email){

        res.redirect('login');

    } else {

        if (!token){
        
            errors.push({ msg: 'No token provided!'});
            res.render('login', {errors})
        }

        const sql = "SELECT * FROM users WHERE token = ?";

        con.query(sql, [token], function(err, result){
            if (err) throw err;

            if (!result.length){
                errors.push({ msg: 'Invalid token!'});
                res.render('login', {errors});
            }
            else {
                session = req.session;
                session.email = result[0].email;
                res.render('changePassword');
            }
        });
    }
})


// Change Password POST Handle
router.post('/', (req, res) => {
    
    session = req.session;

    const { password, password2 } = req.body;
    let errors = [];
    let success = [];

    // Check passwords match
    if (password !== password2) {
        
        errors.push({ msg: 'Passwords do not match' });

    }
    // Check password is of required format
    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!$%@#£€*?&]{8,}$/)){
        
        errors.push({ msg: 'Password must be at least 8 characters, include at least one uppercase letter, one lowercase letter, and one number'});

    }
    // If errors array length is greater than 0, return to changePassword page with errors
    if (errors.length > 0) {
        
        res.render('changePassword', { errors });

    }
    // Else hash entered password and proceed
    else {
        
        const hash = bcrypt.hashSync(password, 10);
        const sql1 = "UPDATE users SET password = ?, token = ? WHERE email = ?";

        con.query(sql1, [hash, func.generateToken(32), session.email], function(err, result){
            if (err) throw err;

            success.push({ msg: 'Password Successfully Changed ! You can now login'});
            res.render('login', {success});
        });
    }
});

module.exports = router;