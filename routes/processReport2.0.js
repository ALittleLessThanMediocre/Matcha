const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');

router.get('/', (req, res) => {

	let errors = [];

	session = req.session;

	if (!session.email){

		errors.push({ msg: 'You have to login to view this resource' });
		res.render('login', { errors });

	} else if (session.email != 'admin@matcha.com'){

		res.render('404');

	} else {

		res.redirect('login');
	}
});

router.get('/:reportId', (req, res) => {

	var reportId = req.params.reportId;
	let errors = [];

	session = req.session;

	if (!session.email){

		errors.push({ msg: 'You have to login to view this resource' });
		res.render('login', { errors });

	} else if (session.email != 'admin@matcha.com'){

		res.render('404');

	} else {

		const sql0 = "UPDATE reports SET processed = '1' WHERE id = ?";

		con.query(sql0, [reportId], function (err, response){
			if (err) throw err;

			const sql1 = "SELECT * FROM blocked WHERE processed = '0'";

			con.query(sql1, [], function (err, result){
				if (err) throw err;

				res.render('blockReq', { result });
			});
		});
	}
});

module.exports = router;