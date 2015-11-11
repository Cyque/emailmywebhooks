var crypto = require('crypto');
var db = require('../modules/database.js')

exports.confirm = function(req, res) {
	var shop = req.query.shop;
	var timestamp = req.query.timestamp;
	var accessToken;

	//check if first time code is present
	if (req.query.code != undefined) 
		accessToken = req.query.code;
	else //if its not present we use the locally saved access token
		accessToken = db.getObject("users/" + shop).accessToken;
	

	var preprocString = "shop=" + shop + "&timestamp=" + timestamp;
	if(req.query.code != undefined) 
		preprocString = "code=" + req.query.code + "&" + preprocString;


	console.log(req.query);
	console.log("Access Token: " + accessToken);
	console.log("timestamp: " + accessToken);
	var calcedHmac = crypto.createHmac("sha256", new Buffer(accessToken)).digest("hex");
	var givenHmac = req.query.hmac;


	if (givenHmac != calcedHmac) {
		console.log("FAILED Authentication");
		console.log("Given HMAC      " + givenHmac);
		console.log("Calculated HMAC " + calcedHmac);
		res.send("Failed Authentication.");
		return false;
	}
	return true;
}

93087798a68d44109e1751a4fbeda0578fdfda962eecc1703602481bd5cd42ca
93087798a68d44109e1751a4fbeda0578fdfda962eecc1703602481bd5cd42ca