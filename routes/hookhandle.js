var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport();
var db = require('../modules/database.js');
var jade = require('jade');
var _ = require('lodash');

exports.handleWebhook = function(req, res) {
   console.log("RECIEVED A WEBHOOK CALL!!");

   db.getWebhook(req.query.id, function(webhookObject) {
      console.log("got the webhook")

      db.getShop(webhookObject.shop, function(shopObject) {
         console.log("got the shop")

         //console.log(webhookObject);
         console.log(shopObject);
         //console.log(req.body);

         console.log("COMPILING JADE");
         var jadePath = "email_templates/" + webhookObject.info.topic + ".jade";
         console.log(jadePath);

         var emailContent = jade.renderFile(jadePath, {
            webhook: webhookObject,
            shop: shopObject,
            body: req.body
         }); // Gets the JADE template file and compiles it

         var emailTo = shopObject.defaultEmail;
         if (webhookObject.email != null && webhookObject.email != undefined)
            emailTo = webhookObject.email;

         console.log("SENDING EMAIL to " + emailTo + " " + shopObject.defaultEmail);

         transporter.sendMail({
               from: 'emailmywebhooks@noreply',
               to: emailTo,
               subject: subjectFromTopic(webhookObject.info.topic),
               // text: emailContent
               html: emailContent
            },
            function(error, info) {
               if (error) {
                  return console.log(error);
               }
               res.status(200).send();
            });

      }); //db.getObject("users/" + webhookObject.shop);
   }); //db.getObject("webhooks/" + req.query.id);

}

/**
customer create / delete
dispute create

*/

function subjectFromTopic(topic) {
   if (topic == "customers\/create") {
      return "A new customer has been created.";
   } else if (topic == "orders\/create") {
      return "A new order has been created.";
   } else if (topic == "carts\/create") {
      return "A new cart has been created.";
   }
}

/*

OUTPUT FOR:
req.body:
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