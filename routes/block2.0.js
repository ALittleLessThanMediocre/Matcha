const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func = require('../functions2.0');

router.get('/', (req, res) => {
    
    session = req.session;

    if (!session.email){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource!' });
        res.render('login', { errors });

    } else if (session.email != 'admin@matcha.com'){
        
        res.render('404');

    } else {
        
        res.redirect('myMatches');
    }
});

router.get('/:viewToken', (req, res) => {
    
    let viewToken = req.params.viewToken;
    
    session = req.session;

    // Check if user is logged in, if not push them back to login with warning
    if (!session.ID){
        
        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});
        
    }
    else {
        // Access current user and offender's credentials
        const sql0 = "SELECT * FROM users WHERE viewToken = ?";

        con.query(sql0, [viewToken], function (err, result){
            if (err) throw err;

            if (result){

                const sql1 = "SELECT * FROM likes WHERE userName = ? AND liked = ?";

                con.query(sql1, [session.email, result[0].email], function (err, ret){
                    if (err) throw err;

                    if (ret){

                        const sql2 = "INSERT INTO blocked (userName, blocked, date) VALUES (?, ?, ?)";

                        con.query(sql2, [session.email, result[0].email, new Date()], function (err, response){
                            if (err) throw err;

                            const sql3 = "DELETE FROM likes WHERE userName = ? AND liked = ?";

                            con.query(sql3, [session.email, result[0].email], function (err, response){
                                if (err) throw err;

                                func.popularity(result[0].email);

                                const sql4 = "SELECT * FROM users WHERE email IN (SELECT liked FROM likes WHERE userName = ? AND liked IN \
                                                (SELECT userName FROM likes WHERE liked = ?))";

                                con.query(sql4, [session.email, session.email], function (err, ret){
                                    if (err) throw err;

                                    res.render('myMatches', { ret });
                                });
                            });
                        });
                    } else {
                        res.redirect('myMatches');
                    }
                });
            } else {
                res.redirect('myMatches');
            }
        });
    }
});

module.exports = router;