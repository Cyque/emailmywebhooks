var request = require("request");
// var cookie = require("./../public/javascripts/cookie.js");
var fs = require('fs');


function read_cookie(k, cookies, r) {
	return ( r = RegExp('(^|; )' + encodeURIComponent(k) + '=([^;]*)').exec(cookies))?r[2]:null;
}

exports.createWebhook = function(req, res) {

	// COOKIES
	// req.headers.cookie.GLOB_API_KEY
	// req.headers.cookie.GLOB_SHOP
	var GLOB_SHOP = read_cookie("GLOB_SHOP", req.headers.cookie);

	var hostBase = "https://emailmywebhooks.herokuapp.com/";
	var topic = decodeURIComponent(req.query.topic); //i.e customers/create

	var method;
	var url = "https://" + GLOB_SHOP + "/";
	// console.log("GLOB_SHOP:  " + GLOB_SHOP);
	var body;



	if(topic == "customers_create") {
		method = "POST";
		url += "admin/webhooks.json";
		body = {
			"webhook": {
				// "topic": "customers\/create",
				"topic": "products\/create",
				"address": hostBase + "handlewebhook",
				"format": "json"
			}
		}
	}
	else {
		res.end("Failed to create webhook. Unknown topic: " + topic + " in " + JSON.stringify(req.query));
	}

	var shopObject = getShop(GLOB_SHOP);

	console.log("SENDING WEBHOOK REQUEST");
	if(method == "POST" || method == "post")
	{
		request.post(
			url,
			{ 
				auth: {
					user: "4bf79cc58eecd7f509f94ce7cd61c6b0",
					pass: "1604e972c082a4a3bb6384c1460f3458"				
				},
				headers:{
					'X-Shopify-Access-Token': shopObject.accessToken
				},
				form: body
			},	
			function (error, response, body) {
				var bodyP = JSON.parse(body);
				console.log(bodyP.errors);
				if (!error || (typeof body["errors"] == "undefined")) {
					console.log('Success adding webhook:');
					console.log(body);

					res.send('Success adding webhook. </br>' + body);
				}
				else {
					res.send("Failure adding webhook </br>" + JSON.stringify(body) + "</br> " + error);
				}
			});	
	} else if (method == "GET" || method == "get") {
		//
	}
};




function getShop(shop) {
	var filePath = "./authorized/" + shop;
	return JSON.parse(fs.readFileSync(filePath));
}
