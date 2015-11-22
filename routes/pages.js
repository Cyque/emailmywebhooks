

//imports
var oauth = require('../modules/oauth.js');



//home page
exports.home = function(req, res) {

	console.log("FULL CONFIRM URL:" + req.originalUrl);
	function hmacVerified(isValid) {
		if(isValid) {
			res.cookie('GLOB_API_KEY', process.env.api_key);
			res.cookie('GLOB_SHOP', req.query.shop);

			res.send("Valid!");
		} else {
			res.send("Hmac validation failed");
		}
	};


	oauth.verifyRequest(req, hmacVerified);

	//res.sendfile('public/html/home.html');
};