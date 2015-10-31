var request = require("request");
// var cookie = require("./../public/javascripts/cookie.js");


function read_cookie(k, cookies, r) {
	return ( r = RegExp('(^|; )' + encodeURIComponent(k) + '=([^;]*)').exec(cookies))?r[2]:null;
}

exports.createWebhook = function(req, res) {

	// COOKIES
	// req.headers.cookie.GLOB_API_KEY
	// req.headers.cookie.GLOB_SHOP
	var GLOB_SHOP = cookie.read_cookie("GLOB_SHOP", req.headers.cookie);

	var hostBase = "https://emailmywebhooks.herokuapp.com/";
	var topic = decodeURIComponent(req.query.topic); //i.e customers/create

	var method;
	var url = GLOB_SHOP + "/";
	// console.log("GLOB_SHOP:  " + GLOB_SHOP);
	var body;



	if(topic == "customers/create") {
		method = "POST";
		url += "admin/webhooks.json";
		body = {
			"webhook": {
				"topic": encodeURIComponent(topic),
				"address": hostBase + "handlewebhook",
				"format": "json"
			}
		}
	}
	else {
		res.end("Failed to create webhook. Unknown topic: " + topic + " in " + JSON.stringify(req.query));
	}

	console.log("SENDING WEBHOOK REQUEST");
	if(method == "POST" || method == "post")
	{
		request.post(
			url,
			{ 
				form: body
			},	
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log('Success adding webhook:');
					console.log(body.webhook);
					res.send('Success adding webhook');
				}
				else {
					res.send("Failure adding webhook </br>" + JSON.stringify(body) + "</br> " + error);
				}
			});	
	} else if (method == "GET" || method == "get") {
		//
	}
};