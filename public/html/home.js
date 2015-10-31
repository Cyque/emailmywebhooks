

ShopifyApp.init({
	apiKey: read_cookie('GLOB_API_KEY'),
	shopOrigin: 'https://' + read_cookie('GLOB_SHOP')
});