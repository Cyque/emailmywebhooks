

var fs = require('fs');

exports.dbpath = "db/";

exports.getObject = function(filename){
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