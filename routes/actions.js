var request = require("request");
// var cookie = require("./../public/javascripts/cookie.js");
var fs = require('fs');
var db = require('../modules/database.js');
var _ = require('lodash');


function read_cookie(k, cookies, r) {
	return ( r = RegExp('(^|; )' + encodeURIComponent(k) + '=([^;]*)').exec(cookies))?r[2]:null;
}

exports.createWebhook = function(req, res) {

	// COOKIES
	// req.headers.cookie.GLOB_API_KEY
	// req.headers.cookie.GLOB_SHOP
	var GLOB_SHOP = read_cookie("GLOB_SHOP", req.headers.cookie);
	var shopObject = getShop(GLOB_SHOP);

	var hostBase = "https://emailmywebhooks.herokuapp.com/";
	var topic = decodeURIComponent(req.query.topic); //i.e customers/create

	var method;
	var baseUrl = "https://" + GLOB_SHOP + "/"
	var url = baseUrl;
	// console.log("GLOB_SHOP:  " + GLOB_SHOP);
	var body;

	var callprops = {
		auth: {
			user: "4bf79cc58eecd7f509f94ce7cd61c6b0",
			pass: "1604e972c082a4a3bb6384c1460f3458"
		},
		headers: {
			'X-Shopify-Access-Token': shopObject.accessToken,
			"content-type": "application/json",
		},
		baseUrl: baseUrl
	}


	if(topic == "deleteall") {
		request.get(url + "admin/webhooks.json", 
		{ 
			auth: {
				user: "4bf79cc58eecd7f509f94ce7cd61c6b0",
				pass: "1604e972c082a4a3bb6384c1460f3458"				
			},
			headers: {
				'X-Shopify-Access-Token': shopObject.accessToken
			} 
		},
		function(error, response, body) {
			var webhooks = JSON.parse(body).webhooks;
			var sdasd = "";
			for(var i = 0; i < webhooks.length; i++) {
				
				request.del(url + "/admin/webhooks/" + webhooks[i].id + ".json",
				{ 
					auth: {
						user: "4bf79cc58eecd7f509f94ce7cd61c6b0",
						pass: "1604e972c082a4a3bb6384c1460f3458"				
					},
					headers: {
						'X-Shopify-Access-Token': shopObject.accessToken
					}
				},	
				function (error, response, body) {			
				});
			}
			res.send(body);	
		});

		return;
	}
	// TAKES var topic in format: "customers_create"
	else if(topic.indexOf("_") != -1 ) {
		method = "POST";
		url += "admin/webhooks.json";
		body = {
			"topic": topic.replace("_", "\/"),
			"address": hostBase + "handlewebhook"
		}
	}
	else {
		res.end("Failed to create webhook. Unknown topic: " + topic + " in " + JSON.stringify(req.query));
		return;
	} 


	console.log("SENDING WEBHOOK REQUEST");

	//DELETE WEBHOOK
	deleteWebhook(callprops, body.topic, function (error, response, body) {
		var body_delete= JSON.parse(body);


		res.send(JSON.stringify(body_delete) + "</br> " + error +"</br>" + JSON.stringify(response));
		return;
		if (!error && (typeof body_delete["errors"] == "undefined")) {
			//CREATE THE WEBHOOK
			createWebhook(callprops, body.address, body.topic, function (error, response, body) {
				var body_create = JSON.parse(body);
				if (!error && (typeof body_create["errors"] == "undefined")) {
					//MODIFY THE WEBHOOK ADDRESS
					modifyWebhookAddress(callprops, body_create.webhook.id, body_create.webhook.address + "?id=" + body_create.webhook.id, 
						function (error, response, body) {

							var body_modify = JSON.parse(body);
							if (!error && (typeof body_modify["errors"] == "undefined")) {
								console.log("CREATED WEBHOOK " + body_create.webhook.id);
								//CREATE WEBHOOK OBJECT
								db.saveObject("webhooks/" + body_create.webhook.id, { 
									info: body_modify.webhook,
									shop: GLOB_SHOP
								});
								res.send('Success adding webhook. </br>' + body);
							} else {
								res.send("Failure adding webhook at modify webhook phase </br>" + JSON.stringify(body_modify) + "</br> " + error +"</br>" + JSON.stringify(response));
							}
						});
				} else {
					res.send("Failure adding webhook </br>" +  JSON.stringify(body_create) + "</br> " + error +"</br>" + JSON.stringify(response));
				}
			});
			//
		} else {
			res.send("Failure adding webhook at delete webhook phase </br>" + JSON.stringify(body_delete) + "</br> " + error +"</br>" + JSON.stringify(response));
		}
	});
};

/*
Deletes all webhooks with the given topic.
callback format: function (error, response, body) {}
is called at the end of all the delete calls. The callback function's paramaters will be that off the last delete call.
*/
function deleteWebhook(callprops, topic, callback) {
	topic = topic.replace("_", "\/");
	console.log("TOPIC: " + topic);

	//Gets a list of all webhooks with the type of the given topic
	request.get(callprops.baseUrl + "admin/webhooks.json?topic=" + topic, 
	{ 
		auth: callprops.auth,
		headers: callprops.headers
	},
	function (error, response, body) {
		//response with list of mathing webhooks

		if(error) {
			callback(error, response, body);
			return;
		}
		var webhooks = JSON.parse(body).webhooks;

		var finished = _.after(webhooks.length, function (error, response, body) {
			callback(error, response, body);
		});

		for(var i = 0; i < webhooks.length; i++) {
			request.del(callprops.baseUrl + "/admin/webhooks/" + webhooks[i].id + ".json",
			{ 
				auth: callprops.auth,
				headers: callprops.headers
			},	
			function (error, response, body) {
				//response from deleted webhook
				finished(error, response, body);
			});
		}
	});
}


function createWebhook(callprops, address, topic, callback) {
	request.post({
		uri: callprops.baseUrl + "admin/webhooks.json",
		auth: callprops.auth,
		headers: callprops.headers,
		body: JSON.stringify({
			"webhook": {
				"topic": topic,
				"address": address,
				"format": "json" 
			}
		})
	},	
	callback); 
}


function modifyWebhookAddress(callprops, webhook_id, address, callback) {
	request.put({ 
		// method: "PUT",
		uri: callprops.baseUrl + "admin/webhooks/" + webhook_id + ".json",
		auth: callprops.auth,
		headers: callprops.headers,
		body: JSON.stringify({
			"webhook": {
				"address": address
			}
		})
	}, callback);
}

function getShop(shop) {
	var filePath = "users/" + shop;
	return db.getObject(filePath);
}
