const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func = require('../functions2.0');

// I think this was when I noticed you don't need to keep connecting...

router.get('/', (req, res) => {

    if (!session.email){

        res.render('login');

    } else {
        
        res.redirect('login');
    }
});
// Route to handle request for viewProf page
router.get('/:viewToken', (req, res) => {
    
    let viewToken = req.params.viewToken;
    let errors = [];
    
    session = req.session;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    }
    else {
        // Find selected user by viewToken
        const sql0 = "SELECT * FROM users WHERE viewToken = ?";

        con.query(sql0, [viewToken], function (err, ret){
            if (err) throw err;

            if (ret[0].email != session.email && session.email != 'admin@matcha.com'){
                const sql1 = "SELECT * FROM profileViews WHERE userName = ? AND viewed = ?";

                con.query(sql1, [session.email, ret[0].email], function (err, visited){
                    if (err) throw err;

                    if (visited.length == 0){
                        const sql2 = "INSERT INTO profileViews (userName, viewed) VALUES (?, ?)";

                        con.query(sql2, [session.email, ret[0].email], function (err, response){
                            if (err) throw err;

                            func.popularity(ret[0].email);
                        });
                    }
                });
            }

            const sql3 = "SELECT * FROM users WHERE viewToken = ?";

            con.query(sql3, [viewToken], function (err, result){
                if (err) throw err;

                const sql4 = "SELECT * FROM users WHERE email IN (SELECT liked FROM likes WHERE userName = ?)";

                con.query(sql4, [result[0].email], function (err, likeArr){
                    if (err) throw err;

                    let like = 0;

                    for(let i = 0; i < likeArr.length; i++){
                        if (likeArr[i].email == session.email)
                            like = 1;
                    }

                    res.render('viewProf', {result, like});
                });
            });
        });
    }
})

module.exports = router;