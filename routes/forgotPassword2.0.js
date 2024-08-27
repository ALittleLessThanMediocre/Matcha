const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const nodemailer = require('nodemailer');
const func  = require('../functions2.0');
require('dotenv').config();


//Forgot Password GET Handle
router.get('/', (req, res) =>{

    let errors = [];

    session = req.session;
    // Check if user is logged in, if true push them back to login with error message
    if (session.email){

        res.redirect('login');
        
    }
    else {
        res.render('forgotPassword');
    }

});

//Forgot Password POST Handle
router.post('/', (req, res) => {
    const { email } = req.body;
    let errors = [];
    let success = [];
    if (!email) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (errors.length > 0) {
        res.render('forgotPassword', {
            errors
        });
    }
    else {
        var Email = email.toLowerCase();

        const sql = "SELECT * FROM users WHERE email = ?";

        con.query(sql, [Email], function(err, result){
            if (err) throw err;

            if (!result.length){
                success.push({ msg: 'Email sent' });
            }
            
            else if (result[0].verified == 'N'){
                func.sendMail(result[0].firstName, result[0].email, result[0].token);
                success.push({ msg: 'Email sent' });
            }

            else {
                func.forgotEmail(result[0].firstName, result[0].email, result[0].token);
                success.push({ msg: 'Email sent' });
            }

            if (success){
                res.render('forgotPassword', {success});
            }
        });
    }
});

module.exports = router;