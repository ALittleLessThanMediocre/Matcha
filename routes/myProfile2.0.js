const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');
// Route to handle request for myProfile page
router.get('/', (req, res) => {
    
    session = req.session;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', { errors });

    }
    else {
        
        const sql = "SELECT * FROM users WHERE email = ?";

        con.query(sql, [session.email], function(err, result){
            if (err) throw err;

            res.render('myProfile', { result });
        });
    }
})

module.exports = router;