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
        
        res.redirect('login');

    }
});
// Route to handle request for suspendAcc page
router.get('/:userId', (req, res) => {
    // Grab userId from request parametes and make usable with native ObjectId method
    var userId = req.params.userId;
    let errors = [];

    session = req.session;

    // Try to find uesr with given Id
    if (!session.email){

        errors.push({ msg: 'You have to login to view this resource' });
        res.render('login', { errors });

    } else if (session.email != 'admin@matcha.com'){
        
        res.render('404');

    } else {

        const sql0 = "UPDATE users SET suspended = '1' WHERE id = ?";

        con.query(sql0, [userId], function (err, result){
            if (err) throw err;

            const sql1 = "SELECT * FROM blocked WHERE processed = '0'";

            con.query(sql1, [], function (err, result){
                if (err) throw err;

                res.render('blockReq', { result });
            });
        });
    }
});

module.exports = router;