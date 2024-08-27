const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const request = require("request");
const fs = require('fs');
const con = require('./config/connect2.0');
const moment = require('moment');

module.exports = {

    sendMail : function sendMail(firstName, Email, token){
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        let mailOptions = {
            from: '"Matcha Admin" <matchatmp2019@gmail.com>',
            to: Email,
            subject: 'Please verify your account',
            html: '<p>Hi there ' + firstName + '<br>Just one more step...<br>Please click the link to verify your account<br><a href="http://localhost:5000/verify/' + token +'">verify<a/></p>' 
        };
        
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) throw err;
            console.log('Email sent...');
        });
    },

    updateMail : function updateMail(firstName, Email, token){
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        let mailOptions = {
            from: '"Matcha Admin" <matchatmp2019@gmail.com>',
            to: Email,
            subject: 'Please verify your account',
            html: '<p>Hi there ' + firstName + '<br>New email = new verify request...<br>By now you know the deal, click the link to verify your account so you can get back to what its really important ;)<br><a href="http://localhost:5000/updateVerify/' + token + '/'+ Email + '">verify<a/></p>' 
        };
        
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) throw err;
            console.log('Email sent...');
        });
    },

    forgotEmail : function forgotEmail(firstName, Email, token){
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        let mailOptions = {
            from: '"Matcha Admin" <matchatmp2019@gmail.com>',
            to: Email,
            subject: 'Forgot Password',
            html: '<p>Hi there ' + firstName + '<br>It seems your memory is failing you...<br>Never fear, just click the link below to update your password<br><a href="http://localhost:5000/changePassword/' + token +'">update<a/></p>' 
        };
        
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) throw err;
            console.log('Email sent...');
        });
    },

    deleteEmail : function deleteEmail(firstName, Email, token){
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        let mailOptions = {
            from: '"Matcha Admin" <matchatmp2019@gmail.com>',
            to: Email,
            subject: 'Account Deletion',
            html: '<p>Hi there ' + firstName + '<br>Unfortunately, due to the outcome of a thorough investigation we have discontiued your access to our service with your current account due to a serious breach in our terms of service...<br>If you choose to return we hope you behave better in future<br></p>' 
        };
        
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) throw err;
            console.log('Email sent...');
        });
    },
    
    age: function age(year, month, day){
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
        return(age);
    },

    generateToken : function generate_token(length){

        var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var b = [];
        for (var i = 0; i < length; i++){
    
            var j = (Math.random() * (a.length-1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join("");
    },
    
    del : function del(filePath){

        fs.unlink(filePath, (err) => {
            if (err) throw err;
        });
    },

    popularity : function popularity(email){

        const sql0 = `SELECT
            (SELECT (COUNT(*) * 0.1) AS myViews FROM profileViews WHERE viewed = ?)
        +   (SELECT (COUNT(*) * 0.25) AS myLikes FROM likes WHERE liked = ?)
        -   (SELECT (COUNT(*) * 0.5) AS myBlocks FROM blocked WHERE blocked = ?) AS popularity`;

        con.query(sql0, [email, email, email], function (err, result){
            if (err) throw err;

            if (result[0].popularity >= 10){
                const sql1 = "UPDATE users SET popularity = ? WHERE email = ?";

                con.query(sql1, ['10', email], function (err, response){
                    if (err) throw err;
                });
            }
            else if (result[0].popularity <= 0){
                const sql2 = "UPDATE users SET popularity = ? WHERE email = ?";

                con.query(sql2, ['1', email], function (err, response){
                    if (err) throw err;
                });
            } else {
                const sql3 = "UPDATE users SET popularity = ? WHERE email = ?";

                con.query(sql3, [result[0].popularity + 5, email], function (err, response){
                    if (err) throw err;
                });
            }
        });
    },

    formatMessage : function formatMessage(sender, receiver, message){

        return {

            sender,
            receiver,
            message,
            date: moment().format('MMMM Do, h:mm a')
        }
    },

    findRoom : function findRoom(sender, receiver, rooms){

        return rooms.findIndex(room => room.match(sender) && room.match(receiver));
    },

    findUser : function findUser(username, users){

        return users.findIndex(user => user.username == username);
    }
}
