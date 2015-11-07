

ShopifyApp.init({
	apiKey: read_cookie('GLOB_API_KEY'),
	shopOrigin: 'https://' + read_cookie('GLOB_SHOP')
});

ShopifyApp.ready(function(){
  	ShopifyApp.Bar.loadingOff()

  	console.log(ShopifyApp.User.current);
});

