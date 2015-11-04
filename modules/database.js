

var fs = require('fs');

exports.dbpath = "db/";

exports.getObject = function(filename){
	if(fs.existsSync(dbpath + filename)) {
		return JSON.parse(fs.readFileSync(exports.dbpath + filename));
	}
	else return undefined;	
}

exports.saveObject = function(filename, object){
	fs.writeFileSync(dbpath + filename, JSON.stringify(object)); 
}