//imports
var oauth = require('../modules/oauth.js');
var permisson = require('./permission.js');
var request = require('request');

var supportedWebhooks = [
	"customers_create",
	"customers_delete",
	"orders_fulfilled",
	"disputes_create",
];


//home page
exports.home = function(req, res) {

	console.log("/HOME CALLED FULL CONFIRM URL:           " + req.originalUrl);


	permisson.verifyPermission(req, res, function(shopObject) {
		renderHome(req, res, shopObject);
		// res.send("worked");
	});

	//res.sendfile('public/html/home.html');
};


function renderHome(req, res, shopObject) {
	// console.log(shopObject);
	request.get("https://" + shopObject.shop + "/admin/webhooks.json", {
		auth: {
			user: process.env.api_key,
			pass: process.env.shared_secret
		},
		headers: {
			'X-Shopify-Access-Token': shopObject.accessToken
		}
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var webhooks = JSON.parse(body).webhooks;
			console.log(webhooks);
			var hasWebhook = {};
			//populate hasWebhook with supported hooks:
			for (var i = 0; i < supportedWebhooks.length; i++) {
				hasWebhook[supportedWebhooks[i]] = false;
			}

			for (var i = 0; i < webhooks.length; i++) {
				var thisTopic = webhooks[i].topic;
				thisTopic = thisTopic.replace("\/", "_");
				hasWebhook[thisTopic] = true;
			}
			console.log(hasWebhook);
			res.render('home', {
				defaultEmail: shopObject.defaultEmail,
				hasWebhook: hasWebhook
			});
		} else {
			res.status(response.statusCode)
		}
	});

};