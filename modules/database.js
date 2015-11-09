

var fs = require('fs');
var pg = require('pg');

// process.env['DATABASE_URL'] = 'postgres://rrgnptrdfrxley:OPtMCtDlA1uoqyZ6-rrJyLihi6@ec2-107-21-223-147.compute-1.amazonaws.com:5432/d1frkvg5roavqs';
exports.dbpath = "db/"

exports.getObject = function(filename){
	// var split = filename.split('/');
	// var table = split[0];
	// var key = split[1];

	// pg.connect(process.env.DATABASE_URL, function(err, client) {
	// 	if (err) throw err;

	// 	console.log('Connected to postgres! Getting schemas...');

	// 	client.query("CREATE TABLE objects(filename char(100) PRIMARY KEY NOT NULL, DATA  CHAR(5000) NOT NULL);");


	// 	// client.query('SELECT table_schema,table_name FROM information_schema.tables;').on('row', function(row) {
	// 	// 	console.log(JSON.stringify(row));
	// 	// });
	// });


	if(fs.existsSync(exports.dbpath + filename)) {
		return JSON.parse(fs.readFileSync(exports.dbpath + filename));
	}
	else {
		console.log("ERROR: FILE " + filename + " NOT FOUND.")
		return undefined;	
	}
}

exports.saveObject = function(filename, object){
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