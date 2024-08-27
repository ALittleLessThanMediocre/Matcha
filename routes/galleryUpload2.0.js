const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const con = require('../config/connect2.0');
const func  = require('../functions2.0');

// Set Storage Engine

const storage = multer.diskStorage({
    destination: './assets/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + 
        path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('userPic');

// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const fileTypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extName = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
    // Check Mime
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName){
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

router.get('/', (req, res) => {

    session = req.session;

    if (!session.email){
        let errors = [];
        errors.push({ msg: 'You have to login to view this resource' });
        res.render('login', { errors });
    }
    else {
        const sql0 = "SELECT * FROM users WHERE email = ?";
        con.query(sql0, [session.email], function(err, result){
            if (err) throw err;

            if (result[0])
                res.render('picUpload', {result});
        });
    }
});

// Route to handle uploading of gallery pictures
router.post('/', (req, res) => {
    
    session = req.session;
    let errors = [];
    let success = [];

    upload(req, res, (err) => {
        if (err){

            const sql1 = "SELECT * FROM users WHERE email = ?";
            con.query(sql1,[session.email], function (err, result){
                if (err) throw err;

                errors.push({ msg: err });
                res.render('picUpload', { errors, result });
            });
        }
        else {
            const { gallery } = req.body;
            if (req.file == undefined || gallery == undefined){

                const sql1 = "SELECT * FROM users WHERE email = ?";
                con.query(sql1, [session.email], function(err, result){
                    if (err) throw err;

                    errors.push({ msg: 'Please select a picture and gallery position' });
                    res.render('picUpload', { errors, result });
                });
            } else {
                // If user choose to update first field of gallery
                if (gallery == "g1") {
                    // If field isn't undefined delete picture
                    const sql1 = "SELECT * FROM users WHERE email = ?";
                    con.query(sql1, [session.email], function(err, result){
                        if (err) throw err;
                        if (result[0].pic1) {
                            func.del("assets/" + result[0].pic1);
                        }

                        const sql2 = "UPDATE users SET pic1 = ? WHERE email = ?";
                        con.query(sql2, ['uploads/' + req.file.filename, session.email], function(err, result){
                            if (err) throw err;

                            const sql3 = "SELECT * FROM users WHERE email = ?";
                            con.query(sql3, [session.email], function(err, result){
                                if (err) throw err;

                                success.push({ msg: 'Image Uploaded!' });
                                res.render('picUpload', { success, result });
                            });
                        });
                    });
                }
                // All the same stuff but for different fields
                if (gallery == "g2") {
                    
                    const sql1 = "SELECT * FROM users WHERE email = ?";
                    con.query(sql1, [session.email], function(err, result){
                        if (err) throw err;
                        if (result[0].pic2) {
                            func.del("assets/" + result[0].pic2);
                        }

                        const sql2 = "UPDATE users SET pic2 = ? WHERE email = ?";
                        con.query(sql2, ['uploads/' + req.file.filename, session.email], function(err, result){
                            if (err) throw err;

                            const sql3 = "SELECT * FROM users WHERE email = ?";
                            con.query(sql3, [session.email], function(err, result){
                                if (err) throw err;

                                success.push({ msg: 'Image Uploaded!' });
                                res.render('picUpload', { success, result });
                            });
                        });
                    });
                }

                if (gallery == "g3") {

                    const sql1 = "SELECT * FROM users WHERE email = ?";
                    con.query(sql1, [session.email], function(err, result){
                        if (err) throw err;
                        if (result[0].pic3) {
                            func.del("assets/" + result[0].pic3);
                        }

                        const sql2 = "UPDATE users SET pic3 = ? WHERE email = ?";
                        con.query(sql2, ['uploads/' + req.file.filename, session.email], function(err, result){
                            if (err) throw err;

                            const sql3 = "SELECT * FROM users WHERE email = ?";
                            con.query(sql3, [session.email], function(err, result){
                                if (err) throw err;

                                success.push({ msg: 'Image Uploaded!' });
                                res.render('picUpload', { success, result });
                            });
                        });
                    });
                }

                if (gallery == "g4") {

                    const sql1 = "SELECT * FROM users WHERE email = ?";
                    con.query(sql1, [session.email], function(err, result){
                        if (err) throw err;
                        if (result[0].pic4) {
                            func.del("assets/" + result[0].pic4);
                        }

                        const sql2 = "UPDATE users SET pic4 = ? WHERE email = ?";
                        con.query(sql2, ['uploads/' + req.file.filename, session.email], function(err, result){
                            if (err) throw err;

                            const sql3 = "SELECT * FROM users WHERE email = ?";
                            con.query(sql3, [session.email], function(err, result){
                                if (err) throw err;

                                success.push({ msg: 'Image Uploaded!' });
                                res.render('picUpload', { success, result });
                            });
                        });
                    });
                }
            }
        }
    });
});

module.exports = router;