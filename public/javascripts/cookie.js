function read_cookie(k,cookies,r) {
	if(cookies == undefined)
		cookies = document.cookie;
	return ( r = RegExp('(^|; )' + encodeURIComponent(k) + '=([^;]*)').exec(cookies))?r[2]:null;
}


if(typeof module !== 'undefined')
	module.exports = {
		read_cookie:read_cookie
	};