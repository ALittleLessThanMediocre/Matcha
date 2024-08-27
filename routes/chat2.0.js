const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');
const moment = require('moment');

router.get('/', (req, res) => {

    session = req.session;

    if (!session.email){

      let errors = [];

      errors.push({ msg: 'You have to login to view this resource' });
      res.render('login', {errors});

    }
    else if(session.email == 'admin@matcha.com'){

      res.redirect('login');

    }
    else{

      const sql0 = "SELECT * FROM users WHERE email IN (SELECT liked FROM likes WHERE userName = ? AND liked IN (SELECT userName FROM likes WHERE liked = ?))";
      
      con.query(sql0, [session.email, session.email], function (err, result){
        if (err) throw err;

        res.render('chatBoard', { result })
      });
    }
});

router.get('/:viewToken', (req, res) => {

  let viewToken = req.params.viewToken;

  session = req.session;

  if (!session.email){

    let errors = [];
    
    errors.push({ msg: 'You have to login to view this resource'});
    res.render('login', {errors});

  } else {

    const sql1 = "SELECT * FROM users WHERE viewToken = ?";
    
    con.query(sql1, [viewToken], function (err, ret){
      if (err) throw err;

      if(ret.length == 1){

        if (ret[0].email != session.email && session.email != 'admin@matcha.com') {

          const sql2 = "SELECT * FROM likes WHERE userName = ? AND liked = ?";

          con.query(sql2, [session.email, ret[0].email], function (err, liked){
            if (err) throw err;
            
            if(liked.length == 1){

              const sql3 = "SELECT * FROM chats WHERE sender = ? AND receiver = ? OR sender = ? AND receiver = ?";

              const sql4 = "SELECT * FROM chats";

              con.query(sql3, [session.email, ret[0].email, ret[0].email, session.email], function (err, result){
                if (err) throw err;
                
                res.render('chat', {ret, result});
              });
            }
          })
        }
      }
    })
  }
});

module.exports = router;