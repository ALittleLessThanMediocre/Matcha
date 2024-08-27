const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const func  = require('../functions2.0');
const con = require('../config/connect2.0');
const geolib = require('geolib');

// Login GET Handle
router.get('/', (req, res) => {
    
    session = req.session;
    let perPage = 8;
    let page = req.params.page || 1;

    if (session.email){
        
        if (session.email != 'admin@matcha.com'){

            const sql6 = "SELECT * FROM users WHERE email = ?";

            con.query(sql6, [session.email], function(err, result){
                if (err) throw err;

                if (result[0].extProfComp){

                    gender = result[0].gender;
                    sexOr = result[0].sexualOrientation;
                    interest1 = result[0].interest1;
                    interest2 = result[0].interest2;
                    interest3 = result[0].interest3;
                    interest4 = result[0].interest4;
                    currentUserLat = result[0].lat;
                    currentUserLng = result[0].lng;

                    if (sexOr == 'Bi'){
                        if (gender == 'Female'){
                            searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Hetro') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Homo')";
                        }
                        else if (gender == 'Male'){
                            searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Homo') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Hetro')";
                        }
                    }
                    else if (sexOr == 'Hetro' && gender == 'Male'){
                        searchPref = "gender = 'Felamle' AND sexualOrientation IN ('Hetro', 'Bi')";
                    }
                    else if (sexOr == 'Hetro' && gender == 'Female'){
                        searchPref = "gender = 'Male' AND sexualOrientation IN ('Hetro', 'Bi')";
                    }
                    else if (sexOr == 'Homo' && gender == 'Male'){
                        searchPref = "gender = 'Male' AND sexualOrientation = 'Homo'";
                    }
                    else if (sexOr == 'Homo' && gender == 'Female'){
                        searchPref = "gender = 'Female' AND sexualOrientation = 'Homo'";
                    }

                    const sql7 = "SELECT * FROM users WHERE email NOT IN (SELECT blocked FROM blocked WHERE userName = ?) AND "
                     + searchPref + " ORDER BY IF (interest1 = ?, 1, 0) + IF (interest2 = ?, 1, 0) + IF (interest3 = ?, 1, 0) + \
                     IF (interest4 = ?, 1, 0) DESC, popularity DESC";

                     con.query(sql7, [session.email, interest1, interest2, interest3, interest4], function (err, ret0){
                        if (err) throw err;

                        for (let i = 0; i < ret0.length; i++){
                            if (geolib.getDistance({ latitude: currentUserLat, longitude: currentUserLng}, 
                                { latitude: ret0[i].lat, longitude: ret0[i].lng }) > 50 * 1000)
                                ret0.splice(i, 1);
                        }

                        for (let i = 0; i < ret0.length; i++){
                            if (ret0[i].suspended != 0 || ret0[i].extProfComp == 0 || ret0[i].email == session.email){
                                ret0.splice(i, 1);
                            }
                        }

                        let ret = ret0.slice((perPage * page) - perPage, (perPage * page));

                        res.render('dashboard', { result, ret, current: page, pages: Math.ceil(ret0.length / perPage)});
                     });
                 } else {

                    const sql2 = "SELECT * FROM users WHERE email = ?";

                    con.query(sql2, [session.email], function(err, result){
                        if (err) throw err;

                        const sql3 = "SELECT COUNT(*) AS count FROM users WHERE online = 'Y'";
                        con.query(sql3, function(err, count){
                            if (err) throw err;

                            const sql4 = "SELECT * FROM users WHERE online = 'Y' LIMIT ?, ? ";
                            
                            con.query(sql4, [(perPage * page) - perPage, perPage], function(err, ret){
                                if (err) throw err;

                                res.render('dashboard', { result, ret, current: page, pages: Math.ceil(count[0].count / perPage)});
                            });
                        });
                    });
                }
            });
        } else {

            const sql2 = "SELECT * FROM users WHERE email = ?";

            con.query(sql2, [session.email], function(err, result){
                if (err) throw err;

                const sql3 = "SELECT COUNT(*) AS count FROM users WHERE online = 'Y'";
                con.query(sql3, function(err, count){
                    if (err) throw err;

                    const sql4 = "SELECT * FROM users WHERE online = 'Y' LIMIT ?, ? ";
                    
                    con.query(sql4, [(perPage * page) - perPage, perPage], function(err, ret){
                        if (err) throw err;

                        res.render('dashboard', { result, ret, current: page, pages: Math.ceil(count[0].count / perPage)});
                    });
                });
            });
        }
    } else {
        res.render('login');
    }
});

// Login POST Handle
router.post('/', (req, res) => {
    
    let perPage = 8;
    let page = req.params.page || 1;

    const { email, password} = req.body;

    let errors = [];
    // Error management of input fields
    if (!email || !password) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        errors.push({msg: 'Invalid email, please try again'});
    }

    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!$%@#£€*?&]{8,}$/)){
        errors.push({ msg: 'Password must be at least 8 characters, include at least one uppercase letter, one lowercase letter, and one number'})
    }
    
    if (errors.length > 0) {
        res.render('login', {
            errors,
        });
    }
    else {
        let Email = email.toLowerCase();

        let find = "SELECT * FROM users WHERE email = ?";
        let searchPref = "";

        con.query(find, Email, function(err, result){
            if (err) throw err;

            if (!result.length){

                errors.push({ msg: "Invalid email or password"});
                res.render('login', {errors});
            }
            else if (bcrypt.compareSync('' + password, '' + result[0].password) == false){
                
                errors.push({ msg: "Invalid email or password"});
                res.render('login', {errors});
            }
            else if (result[0].verified == 'N'){
                
                func.sendMail(result[0].firstName, result[0].email, result[0].token);
                errors.push({ msg: "Email not verified, please check your email and verify your account"});
                res.render('login', {errors});
            }
            else {
                let viewToken = func.generateToken(32);

                const sql5 = "UPDATE users SET online = ?, viewToken = ? WHERE email = ?";

                con.query(sql5, ['Y', viewToken, Email], function(err, response){
                    if (err) throw err;

                    session = req.session;
                    if (Email != "admin@matcha.com"){
                        session.userName = result[0].userName;
                        session.email = Email;
                        session.firstName = result[0].firstName;
                        session.ID = result[0].id;
                        session.extProfComp = result[0].extProfComp;
                        session.token = result[0].token;
                        session.suspended = result[0].suspended;
                        session.query = '';
                        session.profilePicture = result[0].profilePicture;

                        setTimeout(function(){
                            const sql6 = "SELECT * FROM users WHERE email = ?";

                            con.query(sql6, [Email], function(err, result){
                                if (err) throw err;

                                if (result[0].extProfComp){

                                    gender = result[0].gender;
                                    sexOr = result[0].sexualOrientation;
                                    interest1 = result[0].interest1;
                                    interest2 = result[0].interest2;
                                    interest3 = result[0].interest3;
                                    interest4 = result[0].interest4;
                                    currentUserLat = result[0].lat;
                                    currentUserLng = result[0].lng;

                                    if (sexOr == 'Bi'){
                                        if (gender == 'Female'){
                                            searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Hetro') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Homo')";
                                        }
                                        else if (gender == 'Male'){
                                            searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Homo') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Hetro')";
                                        }
                                    }
                                    else if (sexOr == 'Hetro' && gender == 'Male'){
                                        searchPref = "gender = 'Felamle' AND sexualOrientation IN ('Hetro', 'Bi')";
                                    }
                                    else if (sexOr == 'Hetro' && gender == 'Female'){
                                        searchPref = "gender = 'Male' AND sexualOrientation IN ('Hetro', 'Bi')";
                                    }
                                    else if (sexOr == 'Homo' && gender == 'Male'){
                                        searchPref = "gender = 'Male' AND sexualOrientation = 'Homo'";
                                    }
                                    else if (sexOr == 'Homo' && gender == 'Female'){
                                        searchPref = "gender = 'Female' AND sexualOrientation = 'Homo'";
                                    }

                                    const sql7 = "SELECT * FROM users WHERE email NOT IN (SELECT blocked FROM blocked WHERE userName = ?) AND "
                                     + searchPref + " ORDER BY IF (interest1 = ?, 1, 0) + IF (interest2 = ?, 1, 0) + IF (interest3 = ?, 1, 0) + \
                                     IF (interest4 = ?, 1, 0) DESC, popularity DESC";

                                     con.query(sql7, [Email, interest1, interest2, interest3, interest4], function (err, ret0){
                                        if (err) throw err;

                                        for (let i = 0; i < ret0.length; i++){
                                            if (geolib.getDistance({ latitude: currentUserLat, longitude: currentUserLng}, 
                                                { latitude: ret0[i].lat, longitude: ret0[i].lng }) > 50 * 1000)
                                                ret0.splice(i, 1);
                                        }

                                        for (let i = 0; i < ret0.length; i++){
                                            if (ret0[i].suspended != 0 || ret0[i].extProfComp == 0 || ret0[i].email == session.email){
                                                ret0.splice(i, 1);
                                            }
                                        }

                                        let ret = ret0.slice((perPage * page) - perPage, (perPage * page));

                                        res.render('dashboard', { result, ret, current: page, pages: Math.ceil(ret0.length / perPage)});
                                     });
                                } else {
                                    const sql7 = "SELECT COUNT(*) AS count FROM users WHERE email NOT IN (?, ?) AND suspended != 1";

                                    con.query(sql7, ['admin@matcha.com', Email], function(err, count){
                                        if (err) throw err;

                                        const sql8 = "SELECT * FROM users WHERE email NOT IN (?, ?) AND suspended != 1 ORDER BY RAND() LIMIT ?, ?";

                                        con.query(sql8, ['admin@matcha.com', Email, (perPage * page) - perPage, perPage], function(err, ret){
                                            if (err) throw err;

                                            res.render('dashboard', { result, ret, current: page, pages: Math.ceil(count[0].count / perPage)});
                                        });
                                    });
                                }
                            });
                        }, 500);
                    } else {
                        session.userName = result[0].userName;
                        session.email = Email;
                        session.ID = result[0].id;
                        session.extProfComp = result[0].extProfComp;
                        setTimeout(function(){
                            const sql2 = "SELECT * FROM users WHERE email = ?";

                            con.query(sql2, [session.email], function(err, result){
                                if (err) throw err;

                                const sql3 = "SELECT COUNT(*) AS count FROM users WHERE online = 'Y'";
                                con.query(sql3, function(err, count){
                                    if (err) throw err;

                                    const sql4 = "SELECT * FROM users WHERE online = 'Y' LIMIT ?, ?";

                                    con.query(sql4, [(perPage * page) - perPage, perPage], function(err, ret){
                                        if (err) throw err;

                                        res.render('dashboard', { result, ret, current: page, pages: Math.ceil(count[0].count / perPage)});
                                    });
                                });
                            });
                        }, 500);
                    }
                });
            }
        });
    }
});

module.exports = router;