const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
// Route to handle request for viewedBy page
router.get('/', (req, res) => {

    session = req.session;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    } else if (session.email == 'admin@matcha.com') {
        
        res.redirect('login');

    }
    else {
         
         const sql0 = "SELECT * FROM users WHERE email IN (SELECT userName FROM profileViews WHERE viewed = ?) AND suspended != 1";

         con.query(sql0, [session.email], function (err, ret){
            if (err) throw err;

            res.render('viewedBy', { ret });
         });
    }
});

module.exports = router;