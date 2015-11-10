var crypto = require('crypto');
var db = require('../modules/database.js')

exports.confirm = function(req, res) {
	var shop = req.query.shop;
	var timestamp = req.query.timestamp;
	var accessToken = db.getObject("users/" + shop).accessToken;

	var preprocString = "shop=" + shop + "&timestamp=" + timestamp;

	console.log("Access Token: " + accessToken);
	console.log("timestamp: " + accessToken);
	var calcedHmac = crypto.createHmac("sha256", accessToken).digest("hex");
	var givenHmac = req.query.hmac;


	if(givenHmac != calcedHmac) {
		console.log("FAILED Authentication");
		console.log("Given HMAC" + givenHmac);
		console.log("Calculated HMAC" + givenHmac);
		res.send("Failed Authentication.");
	}

}