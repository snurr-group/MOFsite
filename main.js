$(function() {
$("#mofPageLink").click(function() {
	window.location="./mofPage.html";
});
$("#mcDemo").click(function() {
	window.location = "./demo.html";	
});
$("#makeMOF").click(function() {
	window.location = "./maker.html";
});

$( ".accordion" ).accordion( {
		collapsible: true,
		heightStyle: "content"
	});
});
