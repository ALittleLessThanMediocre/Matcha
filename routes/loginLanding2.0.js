const express = require('express');
const router = express.Router();
const func  = require('../functions2.0');
const con = require('../config/connect2.0');
const geolib = require('geolib');

router.get('/', (req, res) => {

    let errors = [];

    session = req.session;

    errors.push({ msg: 'No page provided!' });

    res.redirect('login');
});

router.get('/:page', (req, res) => {
    
    let perPage = 8;
    let page = req.params.page || 1;

    session = req.session;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});
    }
    else {
        // If not admin do pagination calculations then render page

        if (session.email != 'admin@matcha.com'){

            if (session.extProfComp){

                const sql0 = "SELECT * FROM users WHERE email = ?";

                con.query(sql0, [session.email], function(err, result){
                    if (err) throw err;

                    gender = result[0].gender;
                    sexOr = result[0].sexualOrientation;
                    interest1 = result[0].interest1;
                    interest2 = result[0].interest2;
                    interest3 = result[0].interest3;
                    interest4 = result[0].interest4;
                    currentUserLat = result[0].lat;
                    currentUserLng = result[0].lng;
                    
                    if (sexOr == 'Bi'){
                        if (gender == 'Female')
                            searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Hetro') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Homo')";
                        else if (gender == 'Male')
                            searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Homo') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Hetro')";
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

                    const sql1 = "SELECT * FROM users WHERE email NOT IN (SELECT blocked FROM blocked WHERE userName = ?) AND "
                     + searchPref + " ORDER BY IF (interest1 = ?, 1, 0) + IF (interest2 = ?, 1, 0) + IF (interest3 = ?, 1, 0) + \
                     IF (interest4 = ?, 1, 0) DESC, popularity DESC";

                     con.query(sql1, [session.email, interest1, interest2, interest3, interest4], function (err, ret0){
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
                });
            } else {

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
            }

        } else {

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
        }
    }
});

module.exports = router;