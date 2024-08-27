const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
// Route to handle request for myMatches page
router.get('/', (req, res) => {

    session = req.session;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    } else if (session.email == 'admin@matcha.com'){
        
        res.redirect('login');

    }
    else {
        
        const sql0 = "SELECT * FROM users WHERE email IN (SELECT liked FROM likes WHERE userName = ? AND \
                        liked IN (SELECT userName FROM likes WHERE liked = ?))";

        con.query(sql0, [session.email, session.email], function (err, ret){
            if (err) throw err;

            res.render('myMatches', { ret });
        });
    }
});

module.exports = router;