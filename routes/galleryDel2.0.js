const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

// Route to handle clear button on Update Images page
router.post('/', (req, res) => {
    
    session = req.session;
    let errors = [];
    let success = [];
    // Search for current user in user collection
    const sql0 = "SELECT * FROM users WHERE email = ?";

    con.query(sql0, [session.email], function(err, result){
        if (err) throw err;

       // If found, check additional picture fields, if not undefined delete 
        if (result[0].pic1) {
            func.del("assets/" + result[0].pic1);
        }
        if (result[0].pic2) {
            func.del("assets/" + result[0].pic2);
        }
        if (result[0].pic3) {
            func.del("assets/" + result[0].pic3);
        }
        if (result[0].pic4) {
            func.del("assets/" + result[0].pic4);
        }

        const sql1 = "UPDATE users SET pic1 = '', pic2 = '', pic3 = '', pic4 = '' WHERE email = ?";

        con.query(sql1, [session.email], function(err, response){
            if (err) throw err;

            result[0].pic1 = '';
            result[0].pic2 = '';
            result[0].pic3 = '';
            result[0].pic4 = '';

            success.push({ msg: 'Gallery has been cleared!' });
            res.render('picUpload', { result, success });
        });
    });
});

module.exports = router;