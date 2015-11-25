var request = require("request");
// var cookie = require("./../public/javascripts/cookie.js");
var fs = require('fs');
var db = require('../modules/database.js');
var _ = require('lodash');


function read_cookie(k, cookies, r) {
	return (r = RegExp('(^|; )' + encodeURIComponent(k) + '=([^;]*)').exec(cookies)) ? r[2] : null;
}

exports.setDefaultEmail = function(req, res) {
	var GLOB_SHOP = read_cookie("GLOB_SHOP", req.headers.cookie);
	// var shopObject = getShop(GLOB_SHOP);
	db.getShop(GLOB_SHOP, function(shopObject) {
		if (shopObject != undefined) {
			shopObject.defaultEmail = req.body.email;
			db.saveShop(GLOB_SHOP, shopObject);

			console.log("successfully changed shop email to " + shopObject.defaultEmail);
			res.status(100).send();
			//.send("Default email changed to " + shopObject.defaultEmail);
		} else {
			res.status(503).send('Default email not set. Could not find shop.');
		}
	});
}

exports.createWebhook = function(req, res) {

	// COOKIES
	// req.headers.cookie.GLOB_API_KEY
	// req.headers.cookie.GLOB_SHOP
	var GLOB_SHOP = read_cookie("GLOB_SHOP", req.headers.cookie);

	// var shopObject = getShop(GLOB_SHOP);
	db.getShop(GLOB_SHOP, function(shopObject) {
		if (shopObject == undefined)
			res.status(501).send();

		var hostBase = process.env['host']; //i.e https://emailmywebhooks.herokuapp.com/
		var topic = decodeURIComponent(req.query.topic); //i.e customers/create

		var specificEmail = decodeURIComponent(req.query.specificemail);
		//TODO: ADD SPECIFIC EMAIL

		var method;
		var baseUrl = "https://" + GLOB_SHOP + "/"
		var url = baseUrl;
		var body;

		var callprops = {
			auth: {
				user: process.env['api_key'],
				pass: process.env['shared_secret']
			},
			headers: {
				'X-Shopify-Access-Token': shopObject.accessToken,
				"content-type": "application/json",
			},
			baseUrl: baseUrl
		}


		if (topic == "deleteall") {
			//**to be removed**
			request.get(url + "admin/webhooks.json", {
					auth: callprops.auth,
					headers: callprops.headers
				},
				function(error, response, body) {
					var webhooks = JSON.parse(body).webhooks;

					for (var i = 0; i < webhooks.length; i++) {
						//delete db webhook
						db.deleteWebhook(webhooks[i].id);

						//delete webhook on shopify
						request.del(url + "/admin/webhooks/" + webhooks[i].id + ".json", {
								auth: {
									user: process.env['api_key'],
									pass: process.env['shared_secret']
								},
								headers: {
									'X-Shopify-Access-Token': shopObject.accessToken
								}
							},
							function(error, response, body) {});
					}
					res.send(body);
				});

			return;
		}
		// TAKES var topic in format: "customers_create"
		else if (topic.indexOf("_") != -1) {

			method = "POST";
			url += "admin/webhooks.json";
			var topic = topic.replace("_", "\/");
			var hookAddress = hostBase + "handlewebhook";

			console.log("SENDING WEBHOOK REQUEST");
			//DELETE WEBHOOK
			deleteWebhook(callprops, topic, function(error, response, body) {
				var body_delete = JSON.parse(body);
				if (!error && (typeof body_delete["errors"] == "undefined")) {

					//CREATE THE WEBHOOK
					createWebhook(callprops, hookAddress, topic, function(error, response, body) {
						var body_create = JSON.parse(body);
						if (!error && (typeof body_create["errors"] == "undefined")) {

							//MODIFY THE WEBHOOK ADDRESS
							modifyWebhookAddress(callprops, body_create.webhook.id, body_create.webhook.address + "?id=" + body_create.webhook.id,
								function(error, response, body) {

									var body_modify = JSON.parse(body);
									if (!error && (typeof body_modify["errors"] == "undefined")) {
										console.log("CREATED WEBHOOK " + body_create.webhook.id);

										//CREATE WEBHOOK OBJECT
										db.saveWebhook(body_create.webhook.id, {
											info: body_modify.webhook,
											shop: GLOB_SHOP,
											email: specificEmail //CAN be undefined (defaultEmail will be used instead in the hookhandler)
										});

										res.status(200).send('Success adding webhook. </br>' + body);
									} else {
										res.status(500).send("Failure adding webhook at modify webhook phase </br>" + JSON.stringify(body_modify) + "</br> " + error + "</br>" + JSON.stringify(response));
									}
								});
						} else {
							res.status(500).send("Failure adding webhook </br>" + JSON.stringify(body_create) + "</br> " + error + "</br>" + JSON.stringify(response));
						}
					});
				} else {
					res.status(500).send("Failure adding webhook at delete webhook phase </br>" + JSON.stringify(body_delete) + "</br> " + error + "</br>" + JSON.stringify(response));
				}
			});
		} else {
			res.status(500).send("Failed to create webhook. Unknown topic: " + topic + " in " + JSON.stringify(req.query));
			return;
		}

	});
};


exports.deleteWebhook = function(req, res) {
	//GET url params:  topic
	var topic = decodeURIComponent(req.query.topic);
	var GLOB_SHOP = read_cookie("GLOB_SHOP", req.headers.cookie);
	var callprops = {
		auth: {
			user: process.env['api_key'],
			pass: process.env['shared_secret']
		},
		headers: {
			'X-Shopify-Access-Token': undefined
		},
		baseUrl: "https://" + GLOB_SHOP + "/"
	}
	db.getShop(GLOB_SHOP, function(shopObject) {

		callprops.headers['X-Shopify-Access-Token'] = shopObject.accessToken;

		deleteWebhook(callprops, topic, function(error, response, body) {
			if (!error) {
				res.status(200).send("Webhook successfully deleted");
			} else {
				res.status(501).send("Webhook not deleted." + body);
			}
		});
	});

}

/*
Deletes all webhooks with the given topic.
callback format: function (error, response, body) {}
is called at the end of all the delete calls. The callback function's paramaters will be that off the last delete call.
*/
function deleteWebhook(callprops, topic, callback) {
	topic = topic.replace("_", "\/");
	console.log("TOPIC: " + topic);

	//Gets a list of all webhooks with the type of the given topic
	request.get(callprops.baseUrl + "admin/webhooks.json?topic=" + encodeURIComponent(topic), {
			auth: callprops.auth,
			headers: callprops.headers
		},
		function(error, response, body) {
			//response with list of mathing webhooks
			if (error) {
				console.log(error);
				console.log(body);
				callback(error, response, body);
				return;
			}
			var webhooks = JSON.parse(body).webhooks;

			if (webhooks.length > 0) {
				var finished = _.after(webhooks.length, function(error, response, body) {
					callback(error, response, body);
				});

				for (var i = 0; i < webhooks.length; i++) {
					//delete the webhook in the DB
					db.deleteWebhook(webhooks[i].id);

					//send delete request to shopify
					request.del(callprops.baseUrl + "/admin/webhooks/" + webhooks[i].id + ".json", {
							auth: callprops.auth,
							headers: callprops.headers
						},
						function(error, response, body) {
							//response from deleted webhook
							finished(error, response, body);
						});
				}
			} else {
				callback(error, response, body);
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