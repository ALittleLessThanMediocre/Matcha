var numberOfUsersToAdd = 500;

const faker = require('faker');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const ImgPlaceholder = require('random-image-placeholder');
const imgGenerator = new ImgPlaceholder();
const Url = imgGenerator.generate();
require('dotenv').config();

var con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

function age(dateOfBirth){
  var year = dateOfBirth.getFullYear();
  var month = dateOfBirth.getMonth();
  var day = dateOfBirth.getDay();
  

  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth();
  var currentDay = currentDate.getDay();
  var age = currentYear - year;
  if(currentMonth < (month - 1)){
      age--;
  }
  if(((month - 1) == currentMonth) && (currentDay < day)){
      age--;
  }
  return (age);
}

function generateToken(length){

    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var b = [];
    for (var i = 0; i < length; i++){

        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

var sexOrArr = ["Bi", "Homo", "Hetro"];
var genderArr = ["Female", "Male"];
var onlineArr = ["Y", "N"];
var interest1Arr = ["#Traveling", "#Dancing", "#Exercise"];
var interest2Arr = ["#Outdoors","#Politics","#Cooking"];
var interest3Arr = ["#Pets", "#Sports", "#Photography"];
var interest4Arr = ["#Music", "#Learning", "#Art"];
let userArr = [];

console.log("Building user array...");
for (var i = 0; i < numberOfUsersToAdd; i++) {

    var dateOfBirth = faker.date.between(1920, 2001);
    var randSexOr = sexOrArr[Math.floor(Math.random()*sexOrArr.length)];
    var randGender = genderArr[Math.floor(Math.random()*genderArr.length)];
    var randOnline = onlineArr[Math.floor(Math.random()*onlineArr.length)];
    var hash = bcrypt.hashSync("123456Aa", 10);
    var token = generateToken(32);
    var viewToken = generateToken(32);
    var randinterest1 = interest1Arr[Math.floor(Math.random()*interest1Arr.length)];
    var randinterest2 = interest2Arr[Math.floor(Math.random()*interest2Arr.length)];
    var randinterest3 = interest3Arr[Math.floor(Math.random()*interest3Arr.length)];
    var randinterest4 = interest4Arr[Math.floor(Math.random()*interest4Arr.length)];
    var randPop = Math.floor(Math.random()*10);
    var randEmail = faker.internet.email();
 
    var userObj = [

        faker.name.firstName(),
        faker.name.firstName(),
        faker.name.lastName(),
        randEmail.toLowerCase(),
        hash,
        'Y',
        token,
        viewToken,
        randGender,
        randSexOr,
        dateOfBirth,
        age(dateOfBirth),
        faker.lorem.sentence(),
        randinterest1,
        randinterest2,
        randinterest3,
        randinterest4,
        faker.address.city(),
        faker.address.latitude(),
        faker.address.longitude(),
        randPop,
        Url + '?' + Math.random(10000),
        "",
        "",
        "",
        "",
        randOnline,
        faker.date.recent(),
        0,
        1
        
    ];

    userArr.push(userObj);
}

var sql = "INSERT INTO users (userName, firstName, lastName,\
            email, password, verified,\
            token, viewToken, gender,\
            sexualOrientation, dateOfBirth, age,\
            bio, interest1, interest2,\
            interest3, interest4, city,\
            lat, lng, popularity,\
            profilePicture, pic1, pic2,\
            pic3, pic4, online,\
            lastOn, suspended, extProfComp\
            ) VALUES ?;"

// HOW MUCH CAN YOU GET DONE IN 100 MILLISECONDS ?
// A LOT APPARENTLY

setTimeout(function() {
    console.log("User array complete, now adding to database...");
    con.connect(function (err) {
        if (err) throw err;
        con.query(sql, [userArr], function (err, result) {
            if (err) throw err;
            con.end(function(err){
                console.log(`${userArr.length} new accounts added to the database!`);
            });
        });  
    });
}, 100);