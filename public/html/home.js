ShopifyApp.init({
	apiKey: read_cookie('GLOB_API_KEY'),
	shopOrigin: 'https://' + read_cookie('GLOB_SHOP')
});

ShopifyApp.ready(function() {
	ShopifyApp.Bar.loadingOff();
});

function changeEmail() {
	var newEmail = document.getElementById("webhook-email").value;


	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "action/setdefaultemail", true);

	var params = "email=" + newEmail;
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {} else {
				location.reload();
			}
		}
	};
	xhttp.send(params);
	return false;
}

function toggleWebhook(checked, webhookName) {
	console.log("toggled for " + webhookName);
	if (checked) {
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", "action/createhook?topic=" + webhookName, true);
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {} else {
					location.reload();
				}
			}
		};
		xhttp.send();
	} else {
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", "action/createhook?topic=" + webhookName, true);
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {} else {
					location.reload();
				}
			}
		};
		xhttp.send();
	}
}


function resetAllHooks() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var checks = document.getElementsByName("hookitem");
			for (var i = 0; i < checks.length; i++)
				checks[i].checked = false;
		}
	};
	xhttp.open("GET", "action/createhook?topic=deleteall", true);
	xhttp.send();
}