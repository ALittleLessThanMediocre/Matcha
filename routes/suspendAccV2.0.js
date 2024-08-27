const express = require('express');
const router = express.Router();
const con = require('../config/connect2.0');

router.get('/', (req, res) => {

	let errors = [];

	session = req.session;

	let reportID = req.query.reportID;
	let userID = req.query.userID;

	if (!session.email){

		errors.push({ msg: 'You have to login to view this resource' });
		res.render('login', { errors });

	} else if (session.email != 'admin@matcha.com'){
		
		res.render('404');

	} else {

		if (userID && reportID){

			const sql0 = "UPDATE users SET suspended = '1' WHERE id = ?";

			con.query(sql0, [userID], function (err, response){
				if (err) throw err;

				const sql1 = "UPDATE reports SET processed = '1' WHERE id = ?";

				con.query(sql1, [reportID], function (err, response){
					if (err) throw err;

					const sql2 = "SELECT * FROM reports WHERE processed = '0'";

					con.query(sql2, [], function (err, ret){
						if (err) throw err;

						if (ret[0]){

							const sql3 = "SELECT * FROM users WHERE email = ?";

							con.query(sql3, [ret[0].complainant], function (err, ret1){
								if (err) throw err;

								const sql4 = "SELECT * FROM users WHERE email = ?";

								con.query(sql4, [ret[0].complaintAbout], function (err, ret2){
									if (err) throw err;

									res.render('reports', { ret, ret1, ret2 });
								});
							});
						} else {

							let ret1 = [];
							let ret2 = [];

							res.render('reports', { ret, ret1, ret2 });
						}
					});
				});
			});
		} else {

			const sql0 = "SELECT * FROM reports WHERE processed = '0'";

			con.query(sql0, [], function (err, ret){
				if (err) throw err;

				if (ret[0]){

					const sql3 = "SELECT * FROM users WHERE email = ?";

					con.query(sql3, [ret[0].complainant], function (err, ret1){
						if (err) throw err;

						const sql4 = "SELECT * FROM users WHERE email = ?";

						con.query(sql4, [ret[0].complaintAbout], function (err, ret2){
							if (err) throw err;

							res.render('reports', { ret, ret1, ret2 });
						});
					});
				} else {

					let ret1 = [];
					let ret2 = [];

					res.render('reports', { ret, ret1, ret2 });
				}
			});
		}
	}
});

module.exports = router;