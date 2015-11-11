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
	if(host == undefined) { 
		host = "emailmywebhooks.herokuapp.com"
	}

	var shop = req.query.shop;
	var api_key = "4bf79cc58eecd7f509f94ce7cd61c6b0";
	var redirect_uri = encodeURIComponent("https://" + host + "/auth/confirm");
	var scope = "read_customers,read_products,read_orders,read_content,read_themes,read_script_tags,read_fulfillments";
	var state = encodeURIComponent(registerTokenFor(shop));
	var getPermissionURL = "https://" + shop + "/admin/oauth/authorize?client_id=" +  api_key + "&scope=" + scope + "&redirect_uri=" + redirect_uri + "&state=" + state;

	res.redirect(getPermissionURL);

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

	var api_key = "4bf79cc58eecd7f509f94ce7cd61c6b0";
	var secret = "1604e972c082a4a3bb6384c1460f3458";
	var shop = req.query.shop;
	var code = req.query.code;
	var token = req.query.state;


	//CHECK AUTH CONFIRMS HERE
	//check shop, state, and confirm OAUTH hmac
	if(!oauth.confirm(req, res))
		return;

	var accessURL = "https://" + shop + "/admin/oauth/access_token";

	request.post(
		accessURL,
		{ 
			form: { 
				client_id: api_key,
				client_secret: secret,
				code: code,
			}
		},
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//body format: {"access_token":"xxxxx ... xxxx"}

				var accTok = JSON.parse(body).access_token;
				addAccessTokenFor(shop, accTok);
				

				//get shop information

				request.get(
					"https://" + shop + "/admin/shop.json",
					{ 
						auth: {
							user: "4bf79cc58eecd7f509f94ce7cd61c6b0",
							pass: "1604e972c082a4a3bb6384c1460f3458"
						},
						headers: {
							'X-Shopify-Access-Token': accTok
						} 
					},	function (error, response, body) {
						if(!error && response.statusCode == 200) {
							addShopInfoFor(shop, JSON.parse(body).shop);
							res.cookie('GLOB_API_KEY', api_key);
							res.cookie('GLOB_SHOP', shop);
							//FULLY AUTHENTICATED HERE
							res.redirect('home');
						} else {
							console.log("ERROR WITH FETCHING SHOP INFO")
							res.send("ERROR WITH FETCHING SHOP INFO</br>" + body);
						}
					});


			}
		});	
};



/*	Creates a unique token 	*/
function registerTokenFor(shop) {
	// FORMAT: 
	var token;
	filePath = "users/" + shop;
	var object = db.getObject(filePath);

	if(object != undefined) {
		token = crypto.randomBytes(16).toString('hex');
		object.tokens.push(token); 
	}
	else {
		token = crypto.randomBytes(16).toString('hex');
		object = {
			shop: shop,
			tokens: [ token ]
		}
	}

	db.saveObject(filePath, object);
	return token;
}

function addShopInfoFor(shop, info) {
	var filePath = "users/" + shop;

	var object = db.getObject(filePath);
	object.shopInfo = info; 
	console.log(object);

	db.saveObject(filePath, object);
}

function addAccessTokenFor(shop, accessToken) {
	var filePath = "users/" + shop;

	var object = db.getObject(filePath);
	object.accessToken = accessToken; 

	db.saveObject(filePath, object);
}
