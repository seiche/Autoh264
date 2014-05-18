var fs = require('fs');
var mv = require('mv');
var http = require('http');
var formidable = require('formidable');

var server = http.createServer(listen);
server.listen(8081);

function listen(req, res){
	switch(req.method.toLowerCase()){
		case "get":
			serveIndex();
		break;
		case "post":
			handleUpload();
		break;
	}

	function serveIndex(){
		var data = fs.readFileSync('./index.html');
		res.writeHead(200, {'Content-Type':'text/html'});
		res.end(data);
	}

	function handleUpload(){
		var form = new formidable.IncomingForm();
		form.uploadDir = "./tmp";
		form.keepExtensions = true;
		form.parse(req, _parse);
	}

	function _parse(err, fields, files){
		var file = files.file;
		if(typeof file == "undefined")
			res.end("file could not be parsed");
		mv(file.path, '../02convert/'+file.path,_move);
	}

	function _move(err){
		if(err) throw err;
		res.end("file uploaded successfully");
	}

}
