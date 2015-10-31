/* Manages Shopify first time Oauth. */

// var fs = require('fs');


var fs = require('fs');
var crypto = require('crypto');
var request = require('request');

exports.permission = function(req, res) {

	//WILL RECIEVE THIS FIRST
	// https://emb-m4.herokuapp.com/?hmac=8e90f4bbbcc57cd48025cd46ea42942aaa43dbb1a68de718adaf237b9879e43d&shop=damianpolan.myshopify.com&signature=4107661d10d11287f19519eb3a36883c&timestamp=1446233322

	//test with:
	// http://localhost:3000/auth/permission?shop=damianpolan.myshopify.com

	var host = req.headers.host;
	console.log(host);
	if(host == undefined) {
		host = "emailmywebhooks.herokuapp.com"
	}

	var shop = req.query.shop;
	var api_key = "4bf79cc58eecd7f509f94ce7cd61c6b0";
	var redirect_uri = encodeURIComponent("https://" + host + "/auth/confirm");
	var scope = "read_customers,write_customers";
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
				addAccessTokenFor(shop, JSON.parse(body).access_token);
				res.cookie('GLOB_API_KEY', api_key);
				res.cookie('GLOB_SHOP', shop);
				//FULLY AUTHENTICATED HERE
				// res.sendfile('public/html/home.html');
				res.redirect('home');
			}
		});	
};



/*	Creates a unique token 	*/
function registerTokenFor(shop) {
	// FORMAT: 
	var token;
	filePath = "./authorized/" + shop;

	var object;

	if(fs.existsSync(filePath)){
		object = JSON.parse(fs.readFileSync(filePath));
		token = crypto.randomBytes(16).toString('hex');
		object.tokens.push(token); 
	}
	else	
	{
		token = crypto.randomBytes(16).toString('hex');
		object = {
			shop: shop,
			tokens: [ token ]
		}
	}


	fs.writeFile(filePath, JSON.stringify(object), function(err) {
		if(err) {
			return console.log(err);
		}
	}); 

	return token;
}

function addAccessTokenFor(shop, accessToken) {
	var filePath = "./authorized/" + shop;
	var object = JSON.parse(fs.readFileSync(filePath));

	object.accessToken = accessToken; 

	fs.writeFile(filePath, JSON.stringify(object), function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	
}
