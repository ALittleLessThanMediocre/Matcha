const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

router.get('/', (req, res) => {

    session = req.session;

    if (!session.email){
        let errors = [];

        errors.push({ msg: 'You have to login to view this resource!' });
        res.render('login', { errors });

    } else if (session.email == 'admin@matcha.com'){
        res.redirect('login');
    } else {
        const sql0 = "SELECT * FROM users WHERE email IN (SELECT userName FROM profileViews WHERE viewed = ?) AND suspended != 1";

        con.query(sql0, [session.email], function (err, ret){
            if (err) throw err;

            res.render('viewedBy', { result });
        });
    }
});

// Honestly the same as like.js but with different render location
// Intially tried a more abstract solution like using req.headers.refer but couldn't solve edge case problems
// So got lazy and just hard coded the direct route, never repeat this on production level app, lol 

router.get('/:viewToken', (req, res) => {
    let viewToken = req.params.viewToken;
    let errors = [];
    let perPage = 8;
    let page = req.params.page || 1;

    session = req.session;

    if (!session.ID){
        let errors = [];
        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});
    }
    else {
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

            const sql3 = "SELECT * FROM users WHERE email IN (SELECT userName FROM profileViews WHERE viewed = ?) AND suspended != 1";

            con.query(sql3, [session.email], function (err, ret){
                if (err) throw err;

                res.render('viewedBy', { ret });
            });
        }, 100);
    }
})

module.exports = router;