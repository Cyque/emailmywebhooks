var crypto = require('crypto');
var db = require('../modules/database.js');

// exports.confirm = function(query, callback) {
// 	isValidShop(query, function(isValid, message) {
// 		callback(isValid && isValidHmac(query), message);
// 	});
// }

// function isValidShop(query, callback) {
// 	var shop = query.shop;
// 	var nonce = query.state;
// 	console.log(query);

// 	//validate shop name. Must end with myshopify.com and must not contain characters other than letters (a-z), numbers (0-9), dots, and hyphens. 
// 	var suffix = "myshopify.com";
// 	if (shop.indexOf(suffix, shop.length - suffix.length) != -1 && shop.indexOf("([^0-9a-z\.\-])+") == -1) {

// 		//validate shopObject exists and nonce is valid
// 		// var shopObject = db.getObject("users/" + shop);

// 		db.getShop(shop, function(shopObject) {
// 			if (shopObject != undefined)
// 				if(shopObject.nonce == nonce || nonce == undefined)
// 					callback(true, null);
// 				else
// 					callback(false, "nonce not matched: " + shopObject.nonce + " " + nonce);
// 			else
// 				callback(false, "shopObject not found");
// 		});
// 	} else callback(false, "improper shop suffix");
// }

exports.verifyRequest = function (req, res, callback) {
	// callback(isValid:bool])
	var valHmac = isValidHmac(req.query);
	var valShopName = isValidShopName(req.query.shop);
	if(valHmac && valShopName)
		callback();
	else
	{	
		console.log(req.verifyRequest);
		// console.log("Verification failed:     valHmac=" + valHmac + ", valShopName=" + valShopName);
        res.status(401).send("Could not verify the request.");
	}
}


function isValidShopName(shop) {
	var suffix = "myshopify.com";
	return (shop.indexOf(suffix, shop.length - suffix.length) != -1 && shop.indexOf("([^0-9a-z\.\-])+") == -1);
}


function isValidHmac(query) {
	var shared_secret = process.env['shared_secret'];

	var preprocString = encodeParamsForSignature(query);

	var calcedHmac = crypto.createHmac("SHA256", shared_secret).update(new Buffer(preprocString)).digest('hex');

	var givenHmac = query.hmac;

	if (givenHmac != calcedHmac) {
		console.log("FAILED HMAC");
		console.log("FAILED HMAC");
		console.log(givenHmac);
		console.log(calcedHmac);
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