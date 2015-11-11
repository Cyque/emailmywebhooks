var crypto = require('crypto');
var db = require('../modules/database.js')

exports.confirm = function(req, res) {
	var shop = req.query.shop;
	var timestamp = req.query.timestamp;
	var accessToken;

	//check if first time code is present
	if (req.query.code != undefined) 
		accessToken = "1604e972c082a4a3bb6384c1460f3458"; //use secret
	else //if its not present we use the locally saved access token
		accessToken = db.getObject("users/" + shop).accessToken;
	

	var preprocString = "shop=" + shop+ "&state=" + req.query.state + "&timestamp=" + timestamp;
	if(req.query.code != undefined) 
		preprocString = "code=" + req.query.code + "&" + preprocString;

	// preprocString = preprocString.replace("&", "%26");
	// preprocString = preprocString.replace("%", "%25");
	// preprocString = preprocString.replace("=", "%3D");

	console.log(req.query);
	console.log("Access Token: " + accessToken);
	console.log("timestamp: " + accessToken);
	console.log("preprocString " + preprocString)
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
