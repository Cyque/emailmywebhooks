ShopifyApp.init({
	apiKey: read_cookie('GLOB_API_KEY'),
	shopOrigin: 'https://' + read_cookie('GLOB_SHOP')
});

ShopifyApp.ready(function() {
	ShopifyApp.Bar.loadingOff()
});

function changeEmail() {
	var newEmail = document.getElementById("email").value;


	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "action/setdefaultemail" + webhookName, true);

	var params = "email=" + newEmail;
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.setRequestHeader("Content-length", params.length);
	http.setRequestHeader("Connection", "close");



	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {
				console.log("Success Changing email");
			} else {
				console.log("Failed changing email");
			}
			console.log(xhttp.responseText);
		}
	};
	xhttp.send(params);

}

function toggleWebhook(checked, webhookName) {
	console.log("toggled for " + webhookName);
	if (checked) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					console.log("Success Adding Webhook");
				} else {
					console.log("Failed Adding Webhook");
				}
				console.log(xhttp.responseText);
			}
		};
		xhttp.open("GET", "action/createhook?topic=" + webhookName, true);
		xhttp.send();
	} else {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					console.log("Success Removing Webhook");
				} else {
					console.log("Failed Removing Webhook");
				}
				console.log(xhttp.responseText);
			}
		};
		xhttp.open("GET", "action/removehook?topic=" + webhookName, true);
		xhttp.send();
	}
}