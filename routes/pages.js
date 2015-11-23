//imports
var oauth = require('../modules/oauth.js');
var permisson = require('./permisson.js');


//home page
exports.home = function(req, res) {

	console.log("/HOME CALLED FULL CONFIRM URL:           " + req.originalUrl);


	permisson.verifyPermission(req, res, function() {

		//There are two possibilities here. 
		// 1) This is the first time the SHOP has logged into the app and initialization must occur. (i.e get the access token)
		// 2) The shop already has been initialized and has an access token.

		res.send("Confirmed!!");
	});

	//res.sendfile('public/html/home.html');
};