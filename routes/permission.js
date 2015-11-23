var fs = require('fs');
var crypto = require('crypto');
var request = require('request');
var db = require('../modules/database.js')
var oauth = require('../modules/oauth.js')



//called by the shopify API.
exports.confirm = function(req, res) {

	//WILL RECIEVE THIS
	// http://localhost:3000/auth/confirm?
	// code=6860806f796c3eb7fce89128cfb067cb&
	// hmac=762228afe84973729eacc11d7e5ebcc7aa917575bebc104a4865ccf39b5cefac&
	// shop=damianpolan.myshopify.com&
	// signature=a6d04ed60238fa28dc4f8e3e203bd80a&
	// state=6d256e1719ade112a00711e5d64de6e0&\
	// timestamp=1446246040

	// console.log("FULL CONFIRM URL:" + req.originalUrl);
	// console.log(req.query);

	oauth.verifyRequest(req, res, function() {
		var shop = req.query.shop;
		var code = req.query.code;
		var token = req.query.state;

		db.getShop(shop, function(shopObject) {
			request.post("https://" + shop + "/admin/oauth/access_token", {
				form: {
					client_id: process.env.api_key,
					client_secret: process.env.shared_secret,
					code: code,
				}
			}, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					//body format: {"access_token":"xxxxx ... xxxx"}

					var accTok = JSON.parse(body).access_token;
					addAccessTokenFor(shop, accTok);

					//we encode the hmac here for the redirect back to the home page
					res.redirect("/home?shop=" + encodeURIComponent(shop) + "&hmac=" + oauth.generateHmac({
						shop: shop
					}));
				} else {
					res.status(401).send("There was a problem getting the access token.");
				}
			});
		});


	});
}


exports.verifyPermission = function(req, res, callback) {
	var shop = req.query.shop;
	//There are two possibilities here. 
	// 1) This is the first time the SHOP has logged into the app and initialization must occur. (i.e get the access token)
	// 2) The shop already has been initialized and has an access token.

	// check if the shop object already exists and has a private access token
	oauth.verifyRequest(req, res, function() {
		db.getShop(shop, function(shopObject) {
			if (shopObject == undefined || shopObject.accessToken == undefined) {
				//needs to get app permission
				console.log("First Time permission!");
				getFirstTimePermission(req, res);
			} else {
				// permission was already obtained!
				res.cookie('GLOB_API_KEY', process.env.api_key);
				res.cookie('GLOB_SHOP', req.query.shop);
				callback(shopObject);
			}
		});
	});

};


function getFirstTimePermission(req, res) {
	var host = req.headers.host;
	if (host == undefined) {
		host = "emailmywebhooks.herokuapp.com"
	}

	var shop = req.query.shop;
	var redirect_uri = encodeURIComponent("https://" + host + "/auth/confirm");
	var scope = "read_customers,read_products,read_orders,read_content,read_themes,read_script_tags,read_fulfillments";
	// var state = encodeURIComponent(registerTokenFor(shop));

	registerTokenFor(shop, function(state) {
		var getPermissionURL = "https://" + shop + "/admin/oauth/authorize?client_id=" + process.env.api_key + "&scope=" + scope + "&redirect_uri=" + redirect_uri + "&state=" + encodeURIComponent(state);

		res.redirect(getPermissionURL);
	});
}



/*	Creates a unique token 	*/
function registerTokenFor(shop, callback) {

	// filePath = "users/" + shop;
	// var object = db.getObject(filePath);
	db.getShop(shop, function(shopObject) {
		var nonce;
		if (shopObject != undefined) {
			nonce = crypto.randomBytes(16).toString('hex');
			console.log("registerTokenFor generated nonce=" + nonce);
			shopObject.nonce = nonce;
		} else {
			nonce = crypto.randomBytes(16).toString('hex');
			console.log("registerTokenFor generated nonce=" + nonce);
			shopObject = {
				shop: shop,
				nonce: nonce
			}
		}

		db.saveShop(shop, shopObject);
		callback(nonce);
	});
}

function addShopInfoFor(shop, info) {
	// var filePath = "users/" + shop;
	// var object = db.getObject(filePath);

	db.getShop(shop, function(shopObject) {
		shopObject.shopInfo = info;

		if (shopObject.defaultEmail == undefined)
			shopObject.defaultEmail = info.email;

		db.saveShop(shop, shopObject);
	});
}

function addAccessTokenFor(shop, accessToken) {
	// var filePath = "users/" + shop;
	// var object = db.getObject(filePath);

	db.getShop(shop, function(shopObject) {
		shopObject.accessToken = accessToken;

		db.saveShop(shop, shopObject);
	});
}