const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const geolib = require('geolib');

// Route to handle root request
router.get('/', (req, res) => {
    
    session = req.session;
    
    if (session.email){

        res.redirect('login');

    }
    else {
        res.render('welcome');
    }  
});

module.exports = router;