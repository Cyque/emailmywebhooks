
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport();

exports.handleWebhook = function(req, res) {
	console.log("RECIEVED A WEBHOOK CALL!!");


	console.log(req.body);


	transporter.sendMail({
		from: 'emailmywebhooks@noreply',
		to: 'damian.polan@gmail.com',
		subject: 'WEBHOOK',
		text: JSON.stringify(req.body)
	});

	res.sendStatus(200);
}