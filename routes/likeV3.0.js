const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

router.get('/', (req, res) => {

    session = req.session;

    if (!session.email){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource!' });
        res.render('login', { error });

    } else if (session.email == 'admin@matcha.com'){
        
        res.redirect('login');

    } else {
        
        res.redirect('myMatches');
    }
});
// Same as like.js with different page rendered
router.get('/:viewToken', (req, res) => {
    
    let viewToken = req.params.viewToken;
    let errors = [];
    let perPage = 8;
    let page = req.params.page || 1;
    
    session = req.session;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource!'});
        res.render('login', {errors});
    }
    else {
        
        const sql0 = "SELECT * FROM users WHERE viewToken = ?";

        con.query(sql0, [viewToken], function (err, result){
            if (err) throw err;

            if (result[0].email != session.email && session.email != 'admin@matcha.com'){

                const sql1 = "DELETE FROM likes WHERE userName = ? AND liked = ?";

                con.query(sql1, [session.email, result[0].email], function (err, response){
                    if (err) throw err;

                    con.query(sql0, [viewToken], function (err, result){
                        if (err) throw err;

                        func.popularity(result[0].email);
                    })
                });
            }
        });

        setTimeout(function() {

            const sql2 = "SELECT * FROM users WHERE email IN (SELECT liked FROM likes WHERE userName = ? AND \
                            liked IN (SELECT userName FROM likes WHERE liked = ?))";

            con.query(sql2, [session.email, session.email], function (err, ret){
                if (err) throw err;

                res.render('myMatches', { ret });
            });
        }, 100);
    }
})

module.exports = router;