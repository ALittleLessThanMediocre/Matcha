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

    if (!session.ID){
        let errors = [];
        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});
    }
    else {
        const sql0 = "SELECT * FROM users WHERE email = ?";
        con.query(sql0, [session.email], function(err, result){
            if (err) throw err;

            if (result[0].profilePicture != 'undefined' || result[0].profilePicture != '')
                res.render('picUpload', { result });
            else
                res.render('picUpload');
        });
    }
})

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
        } else {
            // Error management
            if (req.file == undefined){
                
                const sql2 = "SELECT * FROM users WHERE email = ?";
                con.query(sql2, [session.email], function(err, result){
                    if (err) throw err;

                    errors.push({ msg: 'No File Selected!' });
                    res.render('picUpload', { errors, result });
                });  
            } else {
                // If file selected for profilePicture
                if (req.file) {
                    // Search for current user in users collection
                    const sql3 = "SELECT * FROM users WHERE email = ?";
                    con.query(sql3, [session.email], function(err, result){
                        if (err) throw err;

                        // If found and profilePicture field not undefined delete picture
                        if (result[0].profilePicture) {
                            func.del("assets/" + result[0].profilePicture);
                        }

                        // Update field with new picture
                        const sql4 = "UPDATE users SET profilePicture = ? WHERE email = ?";
                        con.query(sql4, ['uploads/' + req.file.filename, session.email], function(err, result){
                            if (err) throw err;

                            session.profilePicture = 'uploads/' + req.file.filename;

                            const sql5 = "SELECT * FROM users WHERE email = ?";
                            con.query(sql5, [session.email], function(err, result){
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