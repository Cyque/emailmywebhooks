
var nodemailer = require('nodemailer');

exports.handleWebhook = function(req, res) {
	console.log("RECIEVED A WEBHOOK CALL!!");


	console.log(req.body);

	var transporter = nodemailer.createTransport();

	transporter.sendMail({
		from: 'emailmywebhooks@noreply.com',
		to: 'damian.polan@gmail.com',
		subject: 'WEBHOOK',
		text: JSON.stringify(req.body)
	});

	res.send("Success");
}