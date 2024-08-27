const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');
const geolib = require('geolib');

router.get('/', (req, res) => {

    if (!session.email){

        res.redirect('login');

    } else {
        // If not admin do pagination calculations then render page

        if (session.email != 'admin@matcha.com'){

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

                const sql1 = "SELECT * FROM users WHERE email NOT IN (SELECT personBlocked FROM blocked blockedBy = ?) AND "
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

                    const sql4 = "SELECT * FROM users LIMIT ?, ? WHERE online = 'Y'";
                    con.query(sql4, [(perPage * page) - perPage, perPage], function(err, ret){
                        if (err) throw err;

                        res.render('dashboard', { result, ret, current: page, pages: Math.ceil(count[0].count / perPage)});
                    });
                });
            });
        }
    }
});

router.get('/:viewToken', (req, res) => {
    let viewToken = req.params.viewToken;
    let likes = 0;
    let perPage = 8;
    let page = req.params.page || 1;
    session = req.session;

    if (!session.ID){
        let errors = [];
        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});
    }
    else {
        // Search for current user and selected user in users collection
        const sql0 = "SELECT * FROM users WHERE viewToken = ?";

        con.query(sql0, [viewToken], function (err, result){
            if (err) throw err;

            if (result.length == 1){

                if (result[0].email != session.email && session.email != 'admin@matcha.com'){
                    const sql1 = "SELECT * FROM likes WHERE userName = ? AND liked = ?";

                    con.query(sql1, [session.email, result[0].email], function (err, liked){
                        if (err) throw err;

                        if (liked.length == 0){
                            const sql2 = "INSERT INTO likes (userName, liked) VALUES (?, ?)";

                            con.query(sql2, [session.email, result[0].email], function (err, response){
                                if (err) throw err;

                                func.popularity(result[0].email);
                            });
                        }
                    });
                }
            }
        });

        setTimeout(function() {
            const sql3 = "SELECT * FROM users WHERE email = ?";

            con.query(sql3, [session.email], function(err, result){
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
                    const sql7 = "SELECT COUNT(*) AS count FROM users WHERE email NOT IN (?, ?) AND suspended != 1";

                    con.query(sql7, ['admin@matcha.com', session.email], function(err, count){
                        if (err) throw err;

                        const sql8 = "SELECT * FROM users WHERE email NOT IN (?, ?) AND suspended != 1 ORDER BY RAND() LIMIT ?, ?";

                        con.query(sql8, ['admin@matcha.com', session.email, (perPage * page) - perPage, perPage], function(err, ret){
                            if (err) throw err;

                            res.render('dashboard', { result, ret, current: page, pages: Math.ceil(count[0].count / perPage)});
                        });
                    });
                }
            });
        }, 500);
    }
});

module.exports = router;