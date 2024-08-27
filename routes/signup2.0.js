const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const func = require('../functions2.0');
const mysql = require('mysql');
const con = require('../config/connect2.0');
require('dotenv').config();

// Signup GET Handle
router.get('/', (req, res) => {

    session = req.session;

    if (session.email){

        res.redirect('login');
        
    } else {

        res.render('signup');
    }
});

// Signup POST Handle
router.post('/', (req, res) => {

    // Disassembly of all relevant req.body data
    const { userName, firstName, lastName, email, password, password2 } = req.body;
    let errors = [];
    let success = [];

    // Check required fields
    if (!userName || !firstName || !lastName || !email || !password || !password2) {
        errors.push({msg: 'Please fill in all fields'});
    }
    // Check Names are only uppercase or lowercase letters
    if (!userName.match(/^([A-Za-z]{2,})$/) || !firstName.match(/^([A-Za-z]{2,})$/) || !lastName.match(/^([A-Za-z]{2,})$/)){
        errors.push({msg: 'Names can only include uppercase or lowercase letters and must be at least 2 characters long'});
    }
    // Check for valid email
    if (!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        errors.push({msg: 'Invalid email, please try again'});
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    
    // Check password is of required format
    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!$%@#£€*?&]{8,}$/)){
        errors.push({ msg: 'Password must be at least 8 characters, include at least one uppercase letter, one lowercase letter, and one number'})
    }
    // If errors array is not null render signup page with errors displayed as dismissable text boxes
    if (errors.length > 0) {
        res.render('signup', {
            errors,
            userName,
            firstName,
            lastName,
            email
        });
    }
    // If errors array is empty create user Object containing all input data for later submission to database
    if (errors.length == 0){
        var hash = bcrypt.hashSync(password, 10);
        var Email = email.toLowerCase();
        var token = func.generateToken(32);
        var viewToken = func.generateToken(32);
        var userObj = [

            [userName, firstName, lastName,
             Email, hash, 'N', token, viewToken, "",
             "Bi", 5, "", 'N', 0, 0]
            
        ];

        var sql = "INSERT INTO users (userName, firstName, lastName,\
                    email, password, verified,\
                    token, viewToken, gender,\
                    sexualOrientation, popularity,\
                    bio, online, suspended, extProfComp\
                    ) VALUES ?;"

        let find = "SELECT * FROM users WHERE email = ?";


        con.query(find, Email, function(err, result){
            if (err) throw err;

            if (result.length > 0){

                errors.push({ msg: 'Email already registered, please use another'});
                res.render('signup', {errors});

            }
            else {
                
                con.query(sql, [userObj], function(err){
                    if (err) throw err;
                    func.sendMail(firstName, Email, token);
                    req.flash('success_msg', 'Registration successful! Please check your email to verify your account');
                    res.redirect('login');
                });
            }
        });
    }
});

module.exports = router;