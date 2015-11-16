/*

FORMAT webhook:
filename = 102225029 (webhook id)
{
	shop:'damiansstoree.myshopify.com',
	info: { 
		id: 102225029,
		address: 'https://emailmywebhooks.herokuapp.com/handlewebhook?id=102225029',
		topic: 'customers/create',
		created_at: '2015-11-09T11:59:06-05:00',
		updated_at: '2015-11-09T11:59:06-05:00',
		format: 'json',
		fields: [],
		metafield_namespaces: []
  	}
}

FORMAT users:
filename = damiansstoree.myshopify.com (shop name)
{ 
	shop: 'damiansstoree.myshopify.com',
	tokens: [ 'e368d8243a9cbcc0afbc540c9a0fa0dd' ],
	accessToken: '6f351cbcdf4663dae5988920d92d99f5',
	shopInfo: { 
		id: 10547412,
		name: 'damiansstoree',
		email: 'damianpolan@gmail.com',
		domain: 'damiansstoree.myshopify.com',
		created_at: '2015-11-09T10:15:28-05:00',
		province: 'Ontario',
		country: 'CA',
		address1: '68 bd way',
		zip: 'k2j4r6',
		city: 'Ottawa',
		source: null,
		phone: '6132963208',
		updated_at: '2015-11-09T10:29:06-05:00',
		customer_email: null,
		latitude: 45.2644358,
		longitude: -75.7592437,
		primary_location_id: null,
		primary_locale: 'en',
		country_code: 'CA',
		country_name: 'Canada',
		currency: 'CAD',
		iana_timezone: 'America/Toronto',
		timezone: '(GMT-05:00) America/Toronto',
		shop_owner: 'dam pol',
		money_with_currency_format: '${{amount}} CAD',
		province_code: 'ON',
		money_format: '${{amount}}',
		taxes_included: false,
		tax_shipping: null,
		plan_display_name: 'trial',
		county_taxes: true,
		plan_name: 'trial',
		has_discounts: false,
		has_gift_cards: false,
		google_apps_domain: null,
		myshopify_domain: 'damiansstoree.myshopify.com',
		google_apps_login_enabled: null,
		money_in_emails_format: '${{amount}}',
		money_with_currency_in_emails_format: '${{amount}} CAD',
		eligible_for_payments: true,
		password_enabled: true,
		requires_extra_payments_agreement: false,
		has_storefront: false,
		setup_required: false 
	} 
}


*/



var fs = require('fs');
var pg = require('pg');

process.env['DATABASE_URL'] = 'postgres://rrgnptrdfrxley:OPtMCtDlA1uoqyZ6-rrJyLihi6@ec2-107-21-223-147.compute-1.amazonaws.com:5432/d1frkvg5roavqs';
exports.dbpath = "db/"

function intialize() {
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;

		console.log('Connected to postgres!');

		console.log('Postgres: deleting tables')
		client.query("DROP TABLE IF EXISTS users");
		client.query("DROP TABLE IF EXISTS shops");
		client.query("DROP TABLE IF EXISTS webhooks");

		console.log('Postgres: creating tables');

		var manageError = function(err, result) {
			if (err)
				throw err;
		}

		client.query("CREATE TABLE IF NOT EXISTS shops(shop text PRIMARY KEY NOT NULL, data text NOT NULL)", manageError);

		var lastQuery = client.query("CREATE TABLE IF NOT EXISTS webhooks(webhook_id text PRIMARY KEY NOT NULL, data text NOT NULL)", manageError);

		//
		lastQuery.on("end", function() {
			client.end();
		})
	});
}

intialize();

exports.getShop = function(shop, callback) {
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;

		console.log("Getting shop .... (SELECT)" + shop);
		client.query("SELECT data FROM shops WHERE shop=($1)", [shop], function(err, result) {
			if (err)
				throw err;
			client.end();

			
			if (result.rows.length > 0) {
				console.log("Recieved shop " + shop);
				callback(JSON.parse(result.rows[0].data));
			} else {
				console.log(shop + " NOT FOUND IN DB.")
				callback(undefined);
			}
		});
	});
};

exports.getWebhook = function(hook_id, callback) {
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;
		
		client.query("SELECT data FROM webhooks WHERE webhook_id=($1)", [hook_id], function(err, result) {
			if (err) throw err;
			client.end();

			if (result.rows.length > 0) {
				callback(JSON.parse(result.rows[0].data));
			} else {
				console.log(hook_id + " NOT FOUND IN DB.")
				callback(undefined);
			}
		});
	});
};


exports.saveShop = function(shop, object) {
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;

		client.query("DELETE FROM shops WHERE shop=($1)", [shop], function(err, result) {
			if (err) throw err;
		});

		client.query("INSERT INTO shops (shop, data) VALUES ($1, $2)", [shop, JSON.stringify(object)], function(err, result) {
			if (err) throw err;
			client.end();
		});
	});
}
exports.saveWebhook = function(webhook_id, object) {
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;

		client.query("DELETE FROM webhooks WHERE webhook_id=($1)", [webhook_id], function(err, result) {
			if (err) throw err;
		});

		client.query("INSERT INTO webhooks (webhook_id, data) VALUES ($1, $2)", [webhook_id, JSON.stringify(object)], function(err, result) {
			if (err) throw err;
			client.end();
		});
	});
}

//depricated
exports.getObject_old = function(filename) {
	console.log("db.getObject() is depricated");
	if (fs.existsSync(exports.dbpath + filename)) {
		return JSON.parse(fs.readFileSync(exports.dbpath + filename));
	} else {
		console.log("ERROR: FILE " + filename + " NOT FOUND.")
		return undefined;
	}
}

//depricated
exports.saveObject_old = function(filename, object) {
	console.log("db.saveObject() is depricated");
	fs.writeFileSync(exports.dbpath + filename, JSON.stringify(object));
}



// exports.dbpath = "db/";

// exports.getObject = function(filename){
// 	if(fs.existsSync(exports.dbpath + filename)) {
// 		return JSON.parse(fs.readFileSync(exports.dbpath + filename));
// 	}
// 	else {
// 		console.log("ERROR: FILE " + filename + " NOT FOUND.")
// 		return undefined;	
// 	}
// }

// exports.saveObject = function(filename, object){
// 	fs.writeFileSync(exports.dbpath + filename, JSON.stringify(object)); 
// }