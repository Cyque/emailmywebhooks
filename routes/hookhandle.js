
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport();

exports.handleWebhook = function(req, res) {
	console.log("RECIEVED A WEBHOOK CALL!!");

	transporter.sendMail({
		from: 'emailmywebhooks@noreply',
		to: 'damian.polan@gmail.com',
		subject: 'WEBHOOK',
		text: JSON.stringify(req.body)
	},  
	function(error, info) {
		if(error){
			return console.log(error);
		}
		
		res.sendStatus(200);
	});

}