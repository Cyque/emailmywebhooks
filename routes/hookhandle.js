
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport();
var db = require('../modules/database.js');
var jade = require('jade');

exports.handleWebhook = function(req, res) {
	console.log("RECIEVED A WEBHOOK CALL!!");

	var webhookObject = db.getObject("webhooks/" + req.query.id);
	var shopObject = db.getObject("users/" + webhookObject.shop);

	console.log(webhookObject);
	console.log(shopObject);
	console.log(req.body);



	console.log("COMPILING JADE");
	var jadePath = "email_templates/" + webhookObject.info.topic + ".jade";
	console.log(jadePath);

	var emailContent = jade.renderFile(jadePath, {
		webhook:webhookObject,
		shop:shopObject
	}); // Gets the JADE template file and compiles it
	console.log(emailContent);


	console.log("SENDING EMAIL");
	transporter.sendMail({
		from: 'emailmywebhooks@noreply',
		to: 'damian.polan@gmail.com',
		subject: 'WEBHOOK',
		// text: emailContent
		html:emailContent
	},  
	function(error, info) {
		if(error){
			return console.log(error);
		}
		res.status(200).send();
	});

}

/*
{  
   "id":1875641155,
   "email":null,
   "accepts_marketing":false,
   "created_at":"2015-11-04T13:22:26-05:00",
   "updated_at":"2015-11-04T13:22:26-05:00",
   "first_name":"john",
   "last_name":"smith",
   "orders_count":0,
   "state":"disabled",
   "total_spent":"0.00",
   "last_order_id":null,
   "note":"",
   "verified_email":false,
   "multipass_identifier":null,
   "tax_exempt":false,
   "tags":"",
   "last_order_name":null,
   "default_address":{  
      "id":1998461827,
      "first_name":"john",
      "last_name":"smith",
      "company":"",
      "address1":"",
      "address2":"",
      "city":"",
      "province":"Alberta",
      "country":"Canada",
      "zip":"",
      "phone":"",
      "name":"john smith",
      "province_code":"AB",
      "country_code":"CA",
      "country_name":"Canada",
      "default":true
   },
   "addresses":[  
      {  
         "id":1998461827,
         "first_name":"john",
         "last_name":"smith",
         "company":"",
         "address1":"",
         "address2":"",
         "city":"",
         "province":"Alberta",
         "country":"Canada",
         "zip":"",
         "phone":"",
         "name":"john smith",
         "province_code":"AB",
         "country_code":"CA",
         "country_name":"Canada",
         "default":true
      }
   ]
}
*/