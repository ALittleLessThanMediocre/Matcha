const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');

router.get('/', (req, res) => {

    session = req.session;

    // Check if user is logged in, if not push them back to login with warning
    if (!session.email){
        
        let errors = [];
        
        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    }
    // Check if user is admin, if not push them back to dashboard with warning
    else if (session.email != "admin@matcha.com") {
        
        res.render('404');

    }
    // If admin render block Requests page
    else {
        
        const sql0 = "SELECT * FROM blocked WHERE processed = '0'";

        con.query(sql0, [], function (err, result){
            if (err) throw err;

            res.render('blockReq', { result });
        });
    }
});

module.exports = router;