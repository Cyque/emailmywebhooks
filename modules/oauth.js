var crypto = require('crypto');
var db = require('../modules/database.js')

exports.confirm = function(query) {
	var shop = query.shop;
	var timestamp = query.timestamp;
	var shared_secret = "1604e972c082a4a3bb6384c1460f3458";

	var preprocString = encodeParamsForSignature(query);

	// console.log(query);
	console.log("shared_secret: " + shared_secret);
	console.log("timestamp: " + timestamp);
	console.log("preprocString " + preprocString);

	var calcedHmac = crypto.createHmac("SHA256", shared_secret).update(new Buffer(preprocString, 'hex').digest('hex');

	var givenHmac = query.hmac;

	console.log("Given HMAC      " + givenHmac);
	console.log("Calculated HMAC " + calcedHmac);

	if (givenHmac != calcedHmac) {
		console.log("FAILED Authentication");
		return false;
	}
	return true;
}



function encodeParamsForSignature(object) {
	var list = ["protocol=https://"];
	//var list = [];
	for (var property in object) {
		if (object.hasOwnProperty(property)) {
			// if(property == "shop" || property == "timestamp")
			// 	list.push(property + "=" + object[property]);

			if (property != "hmac" && property != "signature")
				list.push(property + "=" + object[property]);
		}
	}
	return list.join('&');
}