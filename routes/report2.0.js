const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

router.get('/', (req, res) => {
    
    let errors = [];

    session = req.session;

    if (session.email != 'admin@matcha.com'){

        res.redirect('login');

    } else {
        
        errors.push({ msg: 'No reference to user you want to report' });

        let perPage = 8;
        let page = req.params.page || 1;

        const sql0 = "SELECT * FROM users";

        con.query(sql0, [], function (err, result){
            if (err) throw err;

            let sql1 = "SELECT COUNT(*) AS count FROM users";

            con.query(sql1, function (err, count){
                if (err) throw err;

                const sql2 = "SELECT * FROM users LIMIT ?, ?";

                con.query(sql2, [(perPage * page) - perPage, perPage], function (err, ret){
                    if (err) throw err;

                    res.render('dashboard', { errors, result, ret, current: page, pages: Math.ceil(count[0].count / perPage), count: count[0].count });
                });
            });
        });
    }
});
// Route to handle request for report page
router.get('/:viewToken', (req, res) => {
    
    let viewToken = req.params.viewToken;
    let errors = [];
    
    session = req.session;

    if (!session.ID){
        
        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    } else {

        const sql0 = "SELECT * FROM users WHERE viewToken = ?";

        con.query(sql0, [viewToken], function (err, result){
            if (err) throw err;

            if (!result.length){

                let perPage = 8;
                let page = req.params.page || 1;

                errors.push({ msg: "Invalid token" });

                const sql0 = "SELECT * FROM users";

                con.query(sql0, [], function (err, result){
                    if (err) throw err;

                    const sql1 = "SELECT COUNT(*) AS count FROM users";

                    con.query(sql, function (err, count){
                        if (err) throw err;

                        const sql2 = "SELECT * FROM users LIMIT ?, ?";

                        con.query(sql2, [(perPage * page) - perPage, perPage], function (err, ret){
                            if (err) throw err;

                            res.render('dashboard', { errors, result, ret, current: page, pages: Math.ceil(count[0].count / perPage), count: count[0].count });
                        });
                    });
                });
            } else {
                session.complaintAbout = result[0].email;
                res.render('report');
            }
        });
    }
});
// Route to handle post from report page
router.post('/', (req, res) => {

    session = req.session;

    let errors = [];
    let success = [];

    const { subject, text } = req.body;
    // Error management
    if (!subject || !text) {
        errors.push({msg: 'Please fill in all fields'});
    }

    // Some regex that'll allow for specific special characters but not angled brackets " < > ", for security reasons
    if (!subject.match(/^(.*[A-Za-z\d!$%@#£€*?&,. ])$/) || !text.match(/^(.*[A-Za-z\d!$%@#£€*?&,. ])$/gm)){
        errors.push({msg: 'Complaint contains illegal characters, please rephrase'});
    }

    // Disallow any messages longer than 1000 characters, for security and sanity reasons
    if (text.length > 1000) {
        errors.push({msg: 'Message exceeds character limit, please summarize'});
    }

    if (errors.length > 0) {
        res.render('report', { errors });
    }

    if (errors.length == 0) {

        const sql0 = "INSERT INTO reports (complainant, complaintAbout, subject, text) VALUES (?, ?, ?, ?)";

        con.query(sql0, [session.email, session.complaintAbout, subject, text], function (err, result){
            if (err) throw err;

            success.push({ msg: 'Report successfully issued!' });
            res.render('report', { success });
        });
    }
});

module.exports = router;