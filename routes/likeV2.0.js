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
        
        const sql0 = "SELECT * FROM users WHERE email IN (SELECT liked FROM liked WHERE userName = ?) AND suspended != 1";

        con.query(sql0, [session.email], function (err, ret){
            if (err) throw err;

            res.render('myLikes', { result });
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
        
        const sql1 = "SELECT * FROM users WHERE viewToken = ?";

        con.query(sql1, [viewToken], function (err, result){
            if (err) throw err;

            if (result[0].email != session.email && session.email != 'admin@matcha.com'){

                const sql2 = "DELETE FROM likes WHERE userName = ? AND liked = ?";

                con.query(sql2, [session.email, result[0].email], function (err, response){
                    if (err) throw err;

                    con.query(sql1, [viewToken], function (err, result){
                        if (err) throw err;

                        func.popularity(result[0].email);
                    });
                });
            }
        });

        setTimeout(function() {

            const sql3 = "SELECT * FROM users WHERE email IN (SELECT liked FROM likes WHERE userName = ?) AND suspended != 1";

            con.query(sql3, [session.email], function (err, ret){
                if (err) throw err;

                res.render('myLikes', { ret });
            });
        }, 100);
    }
})

module.exports = router;