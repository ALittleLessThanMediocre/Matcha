const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');
// Route to handle request for reports page
router.get('/', (req, res) => {

    session = req.session;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    }
    else if (session.email != "admin@matcha.com") {
        
        res.render('404');
        
    }
    else {
        // Else just render the page
        const sql0 = "SELECT * FROM reports WHERE processed = '0'";

        con.query(sql0, [], function (err, ret){
            if (err) throw err;

            if (ret[0]){

                const sql3 = "SELECT * FROM users WHERE email = ?";

                con.query(sql3, [ret[0].complainant], function (err, ret1){
                    if (err) throw err;

                    const sql4 = "SELECT * FROM users WHERE email = ?";

                    con.query(sql4, [ret[0].complaintAbout], function (err, ret2){
                        if (err) throw err;

                        res.render('reports', { ret, ret1, ret2 });
                    });
                });
            } else {

                let ret1 = [];
                let ret2 = [];

                res.render('reports', { ret, ret1, ret2 });
            }
        }); 
    }
});

module.exports = router;