const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const bcrypt = require('bcrypt');
const func  = require('../functions2.0');
const request = require("request");

// updateProfile GET Handle
router.get('/', (req, res) => {

    session = req.session;

    if (!session.ID){

        let errors = [];
        
        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    }
    else {
        
        res.render('updateProfile');
    }
});

// updateProfile POST Handle
router.post('/', (req, res) => {
    // Telling computer when I use session, I mean req.session, because I am lazy and refuse to type it out multiple times
    session = req.session;
    // Disassembly to grab form data
    const { userName, firstName, lastName, email, gender, sexOr, dateOfBirth, Interests0, Interests1, Interests2, Interests3, password, password2, bio, location } = req.body;
    let errors = [];

    // Check Names are only uppercase or lowercase letters
    if (userName !== '') {
        if (!userName.match(/^([A-Za-z]{2,})$/)){
            errors.push({msg: 'Names can only include uppercase or lowercase letters'});
        }
    }
    if (firstName !== '') {
        if (!firstName.match(/^([A-Za-z]{2,})$/)){
            errors.push({msg: 'Names can only include uppercase or lowercase letters'});
        }
    }
    if (lastName !== '') {
        if (!lastName.match(/^([A-Za-z]{2,})$/)){
            errors.push({msg: 'Names can only include uppercase or lowercase letters'});
        }
    }
    // Check for valid email
    if (email !== '') {
        if (!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
            errors.push({msg: 'Invalid email, please try again'});
        }
    }

    if (dateOfBirth){

        let year = new Date(dateOfBirth).getFullYear();

        if (year < 1920){

            errors.push({ msg: 'Please input your actual age' });
        }

        if (year >= 2003){

            errors.push({ msg: 'The age restriction for this application is 18+, please refrain from using this application if you do not meet it' });
        }
    }

    // Check passwords match
    if (password !== '') {
        if (password !== password2) {
            errors.push({ msg: 'Passwords do not match' });
        }
    }
    // Check password is of required format
    if (password !== '') {
        if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!$%@#£€*?&]{8,}$/)){
            errors.push({ msg: 'Password must be at least 8 characters, include at least one uppercase letter, one lowercase letter, and one number'})
        }
    }
    // Check bio is less than 1000 characters
    if (bio.length > 1000) {
        errors.push({msg: 'Message exceeds character limit, please summarize'})
    }

    if (bio){
        if (!bio.match(/^[^<>()]*$/)){
            errors.push({ msg: 'Bio contains illegal characters, please try again' });
        };
    }
    // If errors array is not null render signup page with errors displayed as dismissable text boxes
    if (errors.length > 0) {
        res.render('updateProfile', {
            errors,
            userName,
            firstName,
            lastName,
            email
        });
    }
    // If errors array is empty proceed
    if (errors.length == 0){
        
        if (password !== '')
            var hash = bcrypt.hashSync(password, 10);
        if (email !== '')
            var Email = email.toLowerCase();
            
        let success = [];
        
        if (userName){
            const sql0 = "UPDATE users SET userName = ? WHERE email = ?";

            con.query(sql0, [userName, session.email], function(err, result){
                if (err) throw err;

                session.userName = userName;
                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (firstName){
            const sql1 = "UPDATE users SET firstName = ? WHERE email = ?";

            con.query(sql1, [firstName, session.email], function(err, result){
                if (err) throw err;

                session.firstName = firstName;
                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (lastName) {
            const sql2 = "UPDATE users SET lastName = ? WHERE email = ?";

            con.query(sql2, [lastName, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Maintain previous email on database, send reconfirmation email to new email
        // Only if that email is verified will it be changed on the database
        if (email){
        
            func.updateMail(session.firstName, email, session.token);
            if (!success.some(success => success.msg === 'Please check your inbox to verify your new account!')){
                success.push({ msg: 'Please check your inbox to verify your new account!'});
            }
        }
        
        if (gender != "Unchanged"){
            const sql3 = "UPDATE users SET gender = ? WHERE email = ?";

            con.query(sql3, [gender, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (sexOr != "Unchanged"){
            const sql4 = "UPDATE users SET sexualOrientation = ? WHERE email = ?";

            con.query(sql4, [sexOr, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (dateOfBirth){

            let year = new Date(dateOfBirth).getFullYear();
            let month = new Date(dateOfBirth).getMonth();
            let day = new Date(dateOfBirth).getDay();
            const Age = func.age(year, month, day);

            const sql5 = "UPDATE users SET dateOfBirth = ?, age = ? WHERE email = ?";

            con.query(sql5, [dateOfBirth, Age, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (Interests0){
            const sql6 = "UPDATE users SET interest1 = ? WHERE email = ?";

            con.query(sql6, [Interests0, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (Interests1) {
            const sql7 = "UPDATE users SET interest2 = ? WHERE email = ?";

            con.query(sql7, [Interests1, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (Interests2) {
            const sql8 = "UPDATE users SET interest3 = ? WHERE email = ?";

            con.query(sql8, [Interests2, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (Interests3) {
            const sql9 = "UPDATE users SET interest4 = ? WHERE email = ?";

            con.query(sql9, [Interests3, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (bio) {
            const sql10 = "UPDATE users SET bio = ? WHERE email = ?";

            con.query(sql10, [bio, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // Pretty self evident
        if (hash) {
            const sql11 = "UPDATE users SET password = ? WHERE email = ?";

            con.query(sql11, [hash, session.email], function(err, result){
                if (err) throw err;

                if (!success.some(success => success.msg === 'update successful!')){
                    success.push({ msg: 'update successful!'});
                }
            });
        }
        // If a location is given we use the here API to get location details
        if (location) {

            var URL = "https://geocoder.ls.hereapi.com/6.2/geocode.json";
            // Below we're building the queryString for the here API by replacing any spaces with "%20"
            searchtext = "?searchtext="+location.replace(/\s+/g, "%20");
            // Include API Key from hidden environmental variables file
            apiKey = "&apiKey=" + process.env.API_KEY;
            // Assign the full queryString to be equal to the URL + searchtext + apiKey
            queryString = URL + searchtext + apiKey;

            request({
                // Using request module to run the queryString
                url: queryString,
                json: true
            }, (err, response, body) => {
                if (!err && response.statusCode == 200) {
                    // If response.statusCode is "OK" aka 200, proceed to grab values from return object
                    let lat, lng, city;
                    // They have a pretty complex return object, so you have to go several levels down to grab what you actually want
                    lat = body.Response.View[0].Result[0].Location.NavigationPosition[0].Latitude;
                    lng = body.Response.View[0].Result[0].Location.NavigationPosition[0].Longitude;
                    city = body.Response.View[0].Result[0].Location.Address.City;
                    const sql12 = "UPDATE users SET lat = ?, lng = ?, city = ? WHERE email = ?";

                    con.query(sql12, [lat, lng, city, session.email], function(err, result){
                        if (err) throw err;

                        if (!success.some(success => success.msg === 'update successful!')){
                            success.push({ msg: 'update successful!'});
                        }
                    });
                }
            })
        }

        const find = "SELECT * FROM users WHERE email = ?";

        con.query(find, [session.email], function(err, result){
            if (err) throw err;
            // Check if user has values in location fields in database
            if (!result[0].city && !result[0].lat && !result[0].lng) {
                // If not, use request module to run URL, which will return a json object of location data from current IP address
                var URL = "https://www.ipapi.co/json";
                request({
                    url: URL,
                    json: true
                }, (err, response, body) => {
                    if (!err && response.statusCode == 200) {
                        // If statusCode returns "OK" proceed
                        const sql14 = "UPDATE users SET city = ?, lat = ?, lng = ? WHERE email = ?";

                        con.query(sql14, [body.city, body.latitude, body.longitude, session.email], function(err, result){
                            if (err) throw err;
                        });
                    }
                });
            }

            con.query(find, [session.email], function(err, result){
                if (err) throw err;
                
                if (result[0].extProfComp != 1){
                    
                    if (result[0].userName && result[0].firstName && result[0].lastName &&
                        result[0].email && result[0].password && result[0].gender && 
                        result[0].sexualOrientation && result[0].dateOfBirth && result[0].bio &&
                        result[0].interest1 && result[0].interest2 && result[0].interest3 && result[0].interest4) {
                        
                        const sql13 = "UPDATE users SET extProfComp = ? WHERE email = ?";

                        con.query(sql13, [1, session.email], function(err, result){
                            if (err) throw err;

                            session.extProfComp = 1;

                            if (!success.some(success => success.msg === 'update successful!')){
                                success.push({ msg: 'update successful!'});
                            }
                        });
                    }
                }
            });
            // Wait 0.5 secs then render page
            setTimeout(() => {
                
                res.render('updateProfile', { success });
            }, 500);
        });
    }
});

module.exports = router;