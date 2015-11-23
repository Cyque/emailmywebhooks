/* GET home page. */
// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };

exports.permission = require("./permission.js");
exports.pages = require("./pages.js");
exports.actions = require("./actions.js");
exports.hookhandle = require("./hookhandle.js");