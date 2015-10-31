function read_cookie(k,r) {
	return(r=RegExp('(^|; )'+encodeURIComponent(k)+'=([^;]*)').exec(document.cookie))?r[2]:null;
}


module.exports = {
	read_cookie:read_cookie
};