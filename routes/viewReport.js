const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";
const dbName = 'matcha';
const Options = { useNewUrlParser: true, useUnifiedTopology: true };
const client = MongoClient(url, Options);
const ObjectId = require('mongodb').ObjectId;

router.get('/', (req, res) => {
    let errors = [];
    
    errors.push({ msg: 'No report ID provided!'});
    dbObj.collection("users").find({email: session.email}).toArray(function(err, result){
        if (err) throw err;
        dbObj.collection("users").find({"online": "Y"}).toArray(function(err, ret){
            if (err) throw err;
            res.render('dashboard', { result, ret, errors });
        });
    });
});
// Route to handle request for viewReport page
router.get('/:reportId', (req, res) => {
    let reportId = req.params.reportId;
    let o_id = new ObjectId(reportId);
    let errors = [];
    session = req.session;

    if (!session.objId){
        errors.push({ msg: 'You have to login to view this resource'});
        res.render('login', {errors});
    }
    // If not admin push back to dashboard with warning
    else if (session.email != "admin@matcha.com") {
        errors.push({ msg: 'You do not have authorisation to view this resource'});
        dbObj.collection("users").find({email: session.email}).toArray(function(err, result){
            if (err) throw err;
            dbObj.collection("users").find({}).toArray(function(err, ret){
                if (err) throw err;
                res.render('dashboard', { result, ret, errors });
            });
        });
    }
    else {
        // Else render page
        dbObj.collection("reports").find( { _id: o_id} ).toArray((err, ret) => {
            if (err) throw err;
            let o_comp = new ObjectId(ret[0].complaintAbout);
            dbObj.collection("users").find( { _id: o_comp } ).toArray((err, result) => {
                if (err) throw err;
                res.render('viewReport', { result, ret } );
            });
        });
    }
})

module.exports = router;