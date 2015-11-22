var crypto = require('crypto');
var db = require('../modules/database.js')

exports.confirm = function(query, callback) {
	isValidShop(query, function(isValid) {
		callback(isValid && isValidHmac(query));
	});
}

function isValidShop(query, callback) {
	var shop = query.shop;
	var nonce = query.state;

	//validate shop name. Must end with myshopify.com and must not contain characters other than letters (a-z), numbers (0-9), dots, and hyphens. 
	var suffix = "myshopify.com";
	if (shop.indexOf(suffix, shop.length - suffix.length) != -1 && shop.indexOf("([^0-9a-z\.\-])+") == -1) {

		//validate shopObject exists and nonce is valid
		// var shopObject = db.getObject("users/" + shop);
		
		db.getShop(shop, function(shopObject) {
			if (shopObject != undefined)
				callback(shopObject.nonce == nonce);
			else
				callback(false);
		});
	} else callback(false);
}

function isValidHmac(query) {
	var shared_secret = process.env['shared_secret'];

	var preprocString = encodeParamsForSignature(query);

	var calcedHmac = crypto.createHmac("SHA256", shared_secret).update(new Buffer(preprocString)).digest('hex');

	var givenHmac = query.hmac;

	if (givenHmac != calcedHmac) {
		console.log("FAILED Authentication");
		return false;
	}

	return true;
}


function encodeParamsForSignature(object) {
	var list = [];
	for (var property in object) {
		if (object.hasOwnProperty(property)) {
			if (property != "hmac" && property != "signature")
				list.push(property + "=" + object[property]);
		}
	}
	return list.sort().join('&');
}