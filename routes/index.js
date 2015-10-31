/* GET home page. */
// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };

exports.auth = require("./auth.js");
exports.pages = require("./pages.js");
exports.actions = require("./actions.js");
exports.hookhandle = require("./hookhandle.js");