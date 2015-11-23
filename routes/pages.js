//imports
var oauth = require('../modules/oauth.js');
var permisson = require('./permission.js');


//home page
exports.home = function(req, res) {

	console.log("/HOME CALLED FULL CONFIRM URL:           " + req.originalUrl);


	permisson.verifyPermission(req, res, function() {

		//There are two possibilities here. 
		// 1) This is the first time the SHOP has logged into the app and initialization must occur. (i.e get the access token)
		// 2) The shop already has been initialized and has an access token.
		res.render('home', {
			defaultEmail: "some email",
			hasWebhook: {}}
		});
		// res.send("worked");
	});

	//res.sendfile('public/html/home.html');
};