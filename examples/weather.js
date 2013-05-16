var jsxml = require("node-jsxml"),
	XML = jsxml.XML,
	http = require("http");

var options={
	host: "query.yahooapis.com",
	path: "/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20location%3D'CHXX0044'"
};
http.get(options, function(response){
	var str = "";
	response.on('data', function (chunk) {
	  str += chunk;
	});
	response.on('end', function(){
	    var xml = new XML(str);
		var condition = xml.descendants("condition").attribute("text").toString();
		console.log("current condiftion is: " +condition);
	});
});