
var nodemailer = require('nodemailer');

exports.handleWebhook = function(req, res) {


	console.log("RECIEVED A WEBHOOK CALL!!");
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'emailmywebhooks@gmail.com',
			pass: 'damian10'
		}
	});

	// NB! No need to recreate the transporter object. You can use
	// the same transporter object for all e-mails

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'EmailMyWebhooks ✔ <emailmywebhooks@gmail.com>', // sender address
	    to: 'damian.polan@gmail.com', // list of receivers
	    subject: 'Hello ✔', // Subject line
	    text: 'Hello world ✔', // plaintext body
	    html: '<b>Hello world ✔</b>' // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);

	});
	res.send("Not implemented.");
}