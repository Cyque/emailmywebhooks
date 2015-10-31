var request = require("request");

exports.createWebhook = function(req, res) {

	// COOKIES
	// req.headers.cookie.GLOB_API_KEY
	// req.headers.cookie.GLOB_SHOP

	var hostBase = "https://emailmywebhooks.herokuapp.com/";
	var topic = decodeURIComponent(req.query.topic); //i.e customers/create

	var method;
	var url = "https://" + (req.headers.cookie.GLOB_SHOP | "damian.polan.myshopify.com") + "/";
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
		res.end("Failed to create webhook. Unknown topic: " + topic + " " + req.query.topic)
	}


	if(method == "POST" || method == "post")
	{
		request.post(
			url,
			{ 
				form: body
			},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log('Success adding webhook:')
					console.log(body.webhook);
					res.end('Success adding webhook');
				}
				else {
					res.send("Failure adding webhook \n" + JSON.stringify(body));
				}
			});	
	} else if (method == "GET" || method == "get") {
		//
	}
};