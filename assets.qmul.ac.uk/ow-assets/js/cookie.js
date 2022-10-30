// check if the cookie has already been set, if not display the notice
cookieValue = $.cookie('QMhasVisited');
if(cookieValue != 'Yes') {
$("<div id='cookieNotice'><a href='#' class='cookieButton' onClick='hideCookieNotice()'>Close</a><p>We use cookies to improve your experience of our website. <a href='http://www.qmul.ac.uk/site/privacy/'>Privacy Policy</a></p></div>").appendTo("div#cookieWrapper");
$('#cookieNotice').hide().fadeIn(2000);
} 
// if the user removes the cookie notice hide the div and set a cookie to remember that decision
function hideCookieNotice(){
	$.cookie('QMhasVisited', 'Yes', { expires: 1000, path: '/', domain: 'qmul.ac.uk'});
	document.getElementById("cookieNotice").className += "hide";
}
setTimeout(function() {
	$.cookie('QMhasVisited', 'Yes');
    $('#cookieNotice').fadeOut(2000);
}, 15000);