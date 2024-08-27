const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

router.post('/', (req, res) => {
    
    session = req.session;
    let errors = [];
    let success = [];
    // Find current user in users collection

    const sql0 = "SELECT * FROM users WHERE email = ?";

    con.query(sql0, [session.email], function(err, result){
        if (err) throw err;

        if (result[0].profilePicture && result[0].profilePicture.match(/userPic/g)){
            func.del("assets/" + result[0].profilePicture);
        }

        const sql1 = "UPDATE users SET profilePicture = '' WHERE email = ?";

        con.query(sql1, [session.email], function(err, response){
            if (err) throw err;

            session.profilePicture = '';

            result[0].profilePicture = "";
            res.render('picUpload', {result});
        });
    });
});

module.exports = router;