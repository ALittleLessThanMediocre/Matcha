const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');

// Logout Handle
router.get('/', (req, res) =>{

    let errors = [];
    
    session = req.session;
    // Find current user in users collection and update relevant fields
    if (session.email){
        const sql = "UPDATE users SET online = ?, lastOn = ? WHERE email = ?";
        con.query(sql, ['N', new Date(), session.email], function(err, result){

            if (err) throw err;

            session.userName = '';
            session.email = '';
            session.firstName = '';
            session.ID = '';
            session.extProfComp = '';
            session.query = '';
            req.session.destroy();
            errors.push({ msg: 'You are now logged out'});
            res.render('login', {errors});
        });
    } else {

        res.render('login');
    }
})

module.exports = router;