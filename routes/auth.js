/* Manages Shopify first time Oauth. */

// var fs = require('fs');


var fs = require('fs');
var crypto = require('crypto');
var request = require('request');
var db = require('../modules/database.js')
var oauth = require('../modules/oauth.js')



exports.permission = function(req, res) {

	//WILL RECIEVE THIS FIRST
	// https://emb-m4.herokuapp.com/?hmac=8e90f4bbbcc57cd48025cd46ea42942aaa43dbb1a68de718adaf237b9879e43d&shop=damianpolan.myshopify.com&signature=4107661d10d11287f19519eb3a36883c&timestamp=1446233322

	//test with:
	// http://localhost:3000/auth/permission?shop=damianpolan.myshopify.com

	var host = req.headers.host;
	// console.log(host);
	if (host == undefined) {
		host = "emailmywebhooks.herokuapp.com"
	}

	var shop = req.query.shop;
	var api_key = process.env['api_key'];
	var redirect_uri = encodeURIComponent("https://" + host + "/auth/confirm");
	var scope = "read_customers,read_products,read_orders,read_content,read_themes,read_script_tags,read_fulfillments";
	// var state = encodeURIComponent(registerTokenFor(shop));

	registerTokenFor(shop, function(state) {
		var getPermissionURL = "https://" + shop + "/admin/oauth/authorize?client_id=" + api_key + "&scope=" + scope + "&redirect_uri=" + redirect_uri + "&state=" + encodeURIComponent(state);

		res.redirect(getPermissionURL);
	});

	//REDIRECT TO THIS AFTER
	// https://{shop}.myshopify.com/admin/oauth/authorize?client_id={api_key}&scope={scopes}&redirect_uri={redirect_uri}&state={nonce}
};


exports.confirm = function(req, res) {

	//WILL RECIEVE THIS
	// http://localhost:3000/auth/confirm?
	// code=6860806f796c3eb7fce89128cfb067cb&
	// hmac=762228afe84973729eacc11d7e5ebcc7aa917575bebc104a4865ccf39b5cefac&
	// shop=damianpolan.myshopify.com&
	// signature=a6d04ed60238fa28dc4f8e3e203bd80a&
	// state=6d256e1719ade112a00711e5d64de6e0&\
	// timestamp=1446246040

	var api_key = process.env['api_key'];
	var secret = process.env['shared_secret'];
	var shop = req.query.shop;
	var code = req.query.code;
	var token = req.query.state;


	//CHECK AUTH CONFIRMS
	oauth.confirm(req.query, function(isValid, message) {
		if (!isValid) {
			console.log("Failed verification: " + message);
			res.send("Failed Authentication." + message); //oauth verification failed
		} else {
			console.log("Passed verification")

			var accessURL = "https://" + shop + "/admin/oauth/access_token";

			//GET access_token
			request.post(
				accessURL, {
					form: {
						client_id: api_key,
						client_secret: secret,
						code: code,
					}
				},
				function(error, response, body) {
					if (!error && response.statusCode == 200) {
						//body format: {"access_token":"xxxxx ... xxxx"}

						var accTok = JSON.parse(body).access_token;
						addAccessTokenFor(shop, accTok);

						//get shop information

						request.get(
							"https://" + shop + "/admin/shop.json", {
								auth: {
									user: process.env['api_key'],
									pass: process.env['shared_secret']
								},
								headers: {
									'X-Shopify-Access-Token': accTok
								}
							},
							function(error, response, body) {
								if (!error && response.statusCode == 200) {
									var bodyP = JSON.parse(body);
									addShopInfoFor(shop, bodyP.shop);

									//FULLY AUTHENTICATED HERE

									db.getShop(shop, function(shopObject) {

										res.cookie('GLOB_API_KEY', api_key);
										res.cookie('GLOB_SHOP', shop);


										//get a list of all the webhooks already registered and push them to the homepage
										request.get("https://" + shop + "/admin/webhooks.json", {
												auth: {
													user: process.env['api_key'],
													pass: process.env['shared_secret']
												},
												headers: {
													'X-Shopify-Access-Token': accTok
												}
											},
											function(error, response, body) {
												var webhooks = JSON.parse(body).webhooks;

												var hasWebhook = {};
												for (var i = 0; i < webhooks.length; i++) {
													var thisTopic = webhooks[i].topic;
													thisTopic = thisTopic.replace("\/", "_");
													hasWebhook[thisTopic] = true;
												}

												res.render('home', {
													defaultEmail: shopObject.defaultEmail,
													hasWebhook: hasWebhook
												});
											});
									});

								} else {
									console.log("ERROR WITH FETCHING SHOP INFO")
									res.send("ERROR WITH FETCHING SHOP INFO</br>" + body);
								}
							});


					}
				});
		}
	});
};
/*	Creates a unique token 	*/
function registerTokenFor(shop, callback) {

	// filePath = "users/" + shop;
	// var object = db.getObject(filePath);
	db.getShop(shop, function(shopObject) {
		var nonce;
		if (shopObject != undefined) {
			nonce = crypto.randomBytes(16).toString('hex');
			shopObject.nonce = nonce;
		} else {
			nonce = crypto.randomBytes(16).toString('hex');
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