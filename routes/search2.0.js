const express = require('express');
const router = express.Router();
const geolib = require('geolib');
const con = require('../config/connect2.0');

// Route to handle request for search page
router.get('/', (req, res) => {

    session = req.session;

    let perPage = 8;
    let page = req.query.page || 1;

    if (!session.ID){

        let errors = [];

        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});

    } else if (session.email == 'admin@matcha.com'){
        
        res.redirect('login');
        
    } else if (session.query != ""){

        const sql0 = "SELECT * FROM users WHERE email = ?";

        con.query(sql0, [session.email], function (err, result){
            if (err) throw err;

            setTimeout(() => {

              con.query(session.query, [session.email], function (err, ret0){
                  if (err) throw err;

                  if (session.endOfSearchAgeRange){
                    for(let x = 0; x < 10; x++){
                      for (let i = 0; i < ret0.length; i++){
                        if (ret0[i].age > Number(session.endOfSearchAgeRange) || ret0[i].age < Number(session.startOfSearchAgeRange)){
                          ret0.splice(i, 1);
                        }
                      }
                    }
                  }

                  if (session.interest1){

                    for(let x = 0; x < 10; x++){
                      for (let i = 0; i < ret0.length; i++){
                        if (ret0[i].interest1 != session.interest1){
                          ret0.splice(i, 1);
                        }
                      }
                    }
                  }

                  if (session.interest2){

                    for(let x = 0; x < 10; x++){
                      for (let i = 0; i < ret0.length; i++){
                        if (ret0[i].interest2 != session.interest2){
                          ret0.splice(i, 1);
                        }
                      }
                    }
                  }

                  if (session.interest3){

                    for(let x = 0; x < 10; x++){
                      for (let i = 0; i < ret0.length; i++){
                        if (ret0[i].interest3 != session.interest3){
                          ret0.splice(i, 1);
                        }
                      }
                    }
                  }

                  if (session.interest4){

                    for(let x = 0; x < 10; x++){
                      for (let i = 0; i < ret0.length; i++){
                        if (ret0[i].interest4 != session.interest4){
                          ret0.splice(i, 1);
                        }
                      }
                    }
                  }

                  if (session.popularity){

                    for(let x = 0; x < 10; x++){
                      for (let i = 0; i < ret0.length; i++){
                        if (ret0[i].popularity > Number(session.popularity)){
                          ret0.splice(i, 1);
                        }
                      }
                    }
                  }

                  if (session.location){
                    for (let i = 0; i < ret0.length; i++){
                        if (geolib.getDistance({ latitude: session.currentUserLat, longitude: session.currentUserLng}, 
                            { latitude: ret0[i].lat, longitude: ret0[i].lng }) > session.location * 1000)
                            ret0.splice(i, 1);
                    }
                  }

                  for(let i = 0; i < ret0.length; i++){
                    if (ret0[i].email == session.email)
                      ret0.splice(i, 1);
                  }

                  setTimeout(function () {

                    let ret = ret0.slice((perPage * page) - perPage, (perPage * page));
                  
                    res.render('search', { ret, current: page, pages: Math.ceil(ret0.length / perPage) });
                  }, 600);
              });
            }, 500);
        });
    } else {
        res.render('search');
    }
});
// Route to handle form posted from search page
router.post('/', (req, res) => {
    
    session = req.session;
    // Grabbing all the relevant data from the req.body
    const { age, interest1, interest2, interest3, interest4, location, popularity, filter } = req.body;
    // Creating variables we'll use later
    let searchAge, searchInterest1, searchInterest2, searchInterest3, searchInterest4, searchPopularity, searchFilter;
    // Pagination variables
    let perPage = 8;
    let page = req.params.page || 1;

    const sql0 = "SELECT * FROM users WHERE email = ?";
    
    con.query(sql0, [session.email], function (err, result){
      if (err) throw err;

      gender = result[0].gender;
      sexOr = result[0].sexualOrientation;
      currentUserLat = result[0].lat;
      currentUserLng = result[0].lng;

      if (sexOr == 'Bi') {
        if (gender == 'Female')
          searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Hetro') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Homo') "
        else if (gender == 'Male')
          searchPref = "gender = 'Male' AND sexualOrientation IN ('Bi', 'Homo') OR gender = 'Female' AND sexualOrientation IN ('Bi', 'Hetro') "
      }
      else if (sexOr == 'Hetro' && gender == 'Male') {
        searchPref = "gender = 'Female' AND sexualOrientation IN ('Hetro', 'Bi') " 
      }
      else if (sexOr == 'Hetro' && gender == 'Female') {
        searchPref = "gender = 'Male' AND sexualOrientation IN ('Hetro', 'Bi') "  
      }
      else if (sexOr == 'Homo' && gender == 'Male') {
        searchPref = "gender = 'Male' AND sexualOrientation = 'Homo' "  
      }
      else if (sexOr == 'Homo' && gender == 'Female') {
        searchPref = "gender = 'Female' AND sexualOrientation = 'Homo' " 
      }

    if (age) {

      var startOfSearchAgeRange;
      var endOfSearchAgeRange;

      if(Array.isArray(age)) {

          startOfSearchAgeRange = `${age[0]}`;

          if (startOfSearchAgeRange == 25)
              startOfSearchAgeRange = '18';
          else if (startOfSearchAgeRange == 35)
              startOfSearchAgeRange = '26';
          else if (startOfSearchAgeRange == 45)
              startOfSearchAgeRange = '36';
          else if (startOfSearchAgeRange == 55)
              startOfSearchAgeRange = '46';
          endOfSearchAgeRange = `${age[age.length - 1] - 0}`;
      }
      else {

        if (age == 25) {
            startOfSearchAgeRange = `18`;
            endOfSearchAgeRange = `${age - 0}`;
        }
        else if (age != 56) {
            startOfSearchAgeRange = `${age - 9}`;
            endOfSearchAgeRange = `${age - 0}`;
        }
        else if (age == 56) {
            startOfSearchAgeRange = `${age - 0}`;
            endOfSearchAgeRange = `100`;
        }
      }

      if (startOfSearchAgeRange == 18 && endOfSearchAgeRange == 56){
              endOfSearchAgeRange = 100;
      }
      session.startOfSearchAgeRange = startOfSearchAgeRange;
      session.endOfSearchAgeRange = endOfSearchAgeRange;
      searchAge = `AND age >= ${startOfSearchAgeRange} AND age <= ${endOfSearchAgeRange} `;
    }

    if (interest1) {
      if(interest1 != 'Unchanged'){

        session.interest1 = interest1;
        searchInterest1 =  `AND interest1 = '${interest1}' ` ;
      }
    }
    if (interest2) {
      if(interest2 != 'Unchanged'){

        session.interest2 = interest2;
        searchInterest2 = `AND interest2 = '${interest2}' ` ;
      }
    }
    if (interest3) {
      if(interest3 != 'Unchanged'){

        session.interest3 = interest3;
        searchInterest3 = `AND interest3 = '${interest3}' ` ;
      }
    }
    if (interest4) {
      if(interest4 != 'Unchanged'){

        session.interest4 = interest4;
        searchInterest4 = `AND interest4 = '${interest4}' ` ;
      }
    }
    if (location) {
      if(location < 100){

        session.location = Number(location);
        session.currentUserLat = currentUserLat;
        session.currentUserLng = currentUserLng;
        searchLocation = `AND acos(sin(${result[0].lat}*PI()/180) * sin(users.lat*PI()/180) + cos(${result[0].lat}*PI()/180) * cos(users.lat*PI()/180) * cos(users.lng*PI()/180 - (${result[0].lng}*PI()/180))) * 6371 <= ${location} `;
      }
      else
        searchLocation = ``;
    }
    if (popularity) {
      if (popularity != 0){

        session.popularity = popularity;
        searchPopularity = `AND popularity = ${popularity} `;
      }
    }
    if (filter) {
      if(filter == 'age'){
        searchFilter = 'ORDER BY age DESC';        
      }
      else if (filter == 'popularity'){
        searchFilter = 'ORDER BY popularity DESC';
      }
      else if (filter == 'location'){
        searchFilter = `ORDER BY acos(sin(${result[0].lat}*PI()/180) * sin(users.lat*PI()/180) + cos(${result[0].lat}*PI()/180) * cos(users.lat*PI()/180) * cos(users.lng*PI()/180 - ${result[0].lng}*PI()/180)) * 6371`;
      }
      else if (filter == `tags`){
        searchFilter = `ORDER BY IF(interest1 = '${result[0].interest1}', 1, 0) + IF(interest2 = '${result[0].interest2}', 1, 0) + IF(interest3 = '${result[0].interest3}', 1, 0) + IF(interest4 = '${result[0].interest4}', 1, 0) DESC`;
      }
    }
    
    setTimeout(() => {
      
      const sql1 = `SELECT * FROM users WHERE email NOT IN (SELECT blocked FROM blocked WHERE userName = ?) AND ` + searchPref + `${searchAge ? searchAge : ''}` + `${searchInterest1 ? searchInterest1: ''}` + `${searchInterest2 ? searchInterest2 : ''}` + `${searchInterest3 ? searchInterest3 : ''}` + `${searchInterest4 ? searchInterest4 : ''}` + `${searchLocation ? searchLocation : ''}` + `${searchPopularity ? searchPopularity : ''}` + `${searchFilter ? searchFilter : ''}`;
      
      session.query = sql1;
      
      con.query(sql1, [session.email], function (err, ret0){
        if (err) throw err;

        if (age){
          
          for(let x = 0; x < 10; x++){
            for (let i = 0; i < ret0.length; i++){
              if (ret0[i].age > Number(endOfSearchAgeRange) || ret0[i].age < Number(startOfSearchAgeRange)){
                ret0.splice(i, 1);
              }
            }
          }
        } else {

          session.startOfSearchAgeRange = "";
          session.endOfSearchAgeRange = "";
        }

        if (interest1 != 'Unchanged'){

          for(let x = 0; x < 10; x++){
            for (let i = 0; i < ret0.length; i++){
              if (ret0[i].interest1 != interest1){
                ret0.splice(i, 1);
              }
            }
          }
        } else {

          session.interest1 = "";
        }

        if (interest2 != 'Unchanged'){

          for(let x = 0; x < 10; x++){
            for (let i = 0; i < ret0.length; i++){
              if (ret0[i].interest2 != interest2){
                ret0.splice(i, 1);
              }
            }
          }
        } else {

          session.interest2 = "";
        }

        if (interest3 != 'Unchanged'){

          for(let x = 0; x < 10; x++){
            for (let i = 0; i < ret0.length; i++){
              if (ret0[i].interest3 != interest3){
                ret0.splice(i, 1);
              }
            }
          }
        } else {

          session.interest3 = "";
        }

        if (interest4 != 'Unchanged'){

          for(let x = 0; x < 10; x++){
            for (let i = 0; i < ret0.length; i++){
              if (ret0[i].interest4 != interest4){
                ret0.splice(i, 1);
              }
            }
          }
        } else {

          session.interest4 = "";
        }

        if (popularity != 0){

          for(let x = 0; x < 10; x++){
            for (let i = 0; i < ret0.length; i++){
              if (ret0[i].popularity > Number(popularity)){
                ret0.splice(i, 1);
              }
            }
          }
        } else {

          session.popularity = "";
        }

        if (location){
          if (location < 100){
            for (let i = 0; i < ret0.length; i++){
                if (geolib.getDistance({ latitude: currentUserLat, longitude: currentUserLng}, 
                    { latitude: ret0[i].lat, longitude: ret0[i].lng }) > Number(location) * 1000)
                    ret0.splice(i, 1);
            }
          } else {

            session.location = "";
            session.currentUserLat = "";
            session.currentUserLng = "";
          }
        }

        for(let i = 0; i < ret0.length; i++){
          if (ret0[i].email == session.email)
            ret0.splice(i, 1);
        }

        setTimeout(function () {

          let ret = ret0.slice((perPage * page) - perPage, (perPage * page));
        
          res.render('search', { ret, current: page, pages: Math.ceil(ret0.length / perPage) });
        }, 500);
      })
    }, 500)
  }) 
});

module.exports = router;