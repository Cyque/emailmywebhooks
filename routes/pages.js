//imports
var oauth = require('../modules/oauth.js');
var auth = require('./auth.js');


//home page
exports.home = function(req, res) {

	console.log("/HOME CALLED FULL CONFIRM URL:           " + req.originalUrl);


	oauth.verifyRequest(req, res, function() {
		res.cookie('GLOB_API_KEY', process.env.api_key);
		res.cookie('GLOB_SHOP', req.query.shop);

		//There are two possibilities here. 
		// 1) This is the first time the SHOP has logged into the app and initialization must occur. (i.e get the access token)
		// 2) The shop already has been initialized and has an access token.

		res.render('home', {
			defaultEmail: "",
			hasWebhook: {}
		});


	});

	//res.sendfile('public/html/home.html');
};