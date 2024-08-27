const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');

router.get('/', (req, res) => {
    
    let errors = [];
    
    session = req.session;

    if (!session.email){

        errors.push({ msg: 'You have to login to view this resource' });
        res.render('login', { errors });

    } else if (session.email != 'admin@matcha.com'){

        res.render('404');

    } else {

        errors.push({ msg: 'No report ID provided!' });

        const sql0 = "SELECT * FROM blocked WHERE processed = '0'";

        con.query(sql0, [], function (err, result){
            if (err) throw err;

            res.render('blockReq', { result, errors });
        });
    }
});
// Route to handle request for viewBlockReq page
router.get('/:blockReqId', (req, res) => {

    let blockReqId = req.params.blockReqId;
    let errors = [];

    session = req.session;

    if (!session.email){

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    }
    // If not admin push back to dashboard with warning
    // Just noticed I have to add pagination variables to a bunch of these old routes, f**k
    else if (session.email != "admin@matcha.com") {
        
        res.render('404');

    }
    else {
        // If admin render page
        const sql0 = "SELECT * FROM blocked WHERE userId = ?";

        con.query(sql0, [blockReqId], function (err, result){
            if (err) throw err;

            const sql1 = "SELECT * FROM users WHERE email = ?";

            con.query(sql1, [result[0].userName], function (err, ret1){
                if (err) throw err;

                const sql2 = "SELECT * FROM users WHERE email = ?";

                con.query(sql2, [result[0].blocked], function (err, ret2){
                    if (err) throw err;

                    res.render('viewBlockReq', { ret1, ret2, result });
                });
            });
        });
    }
})

module.exports = router;