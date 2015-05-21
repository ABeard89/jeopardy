var gameVersion = "v1.0.0";

var adminEmailAddress = "anthony.beard89@gmail.com";
var capturedUserAgent = navigator.userAgent;

var lineFeed = "%0D%0A"

var emailSubject = "Jeopardy Feedback " +gameVersion;
var emailBody = "User Agent:" +lineFeed +capturedUserAgent +lineFeed +lineFeed +"My Comments:" +lineFeed;

var mailToString = "mailto:" +adminEmailAddress +"?subject=" +emailSubject +"&body=" +emailBody;

var refreshInfo = function () {
	$(".mailToAdmin").each(function(){
		$(this).attr("href", mailToString).html(adminEmailAddress);
	});
	
	$(".versionNumber").each(function(){
		$(this).html(gameVersion);
	});
};