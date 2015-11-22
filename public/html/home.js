

ShopifyApp.init({
	apiKey: read_cookie('GLOB_API_KEY'),
	shopOrigin: 'https://' + read_cookie('GLOB_SHOP')
});

ShopifyApp.ready(function(){
	console.log("READY");
  	ShopifyApp.Bar.loadingOff()
});


function toggleWebhook(checked, webhookName) {

	if (checked) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				console.log("Success");
			}
		};
		xhttp.open("GET", "action/createhook", true);
		xhttp.send();
	} else {


	}
}