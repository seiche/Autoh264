/* -- imports -- */
var fs = require('fs');
var chokidar = require('chokidar');
var rand = require("generate-key");
var ProgressBar = require('progress');
var FFmpeg = require('fluent-ffmpeg');
var Metadata = require('fluent-ffmpeg').Metadata;

/* -- variables -- */

var busy = false;
var queue = [];

var options = {
	ignoreInitial : false,
	persistent : true
}

/* -- watch -- */
var watcher = chokidar.watch('./tmp', options);
watcher.on('add', _add);

/* -- on add -- */
function _add(path){
	console.log(path + " was added");
	Metadata(path, function(data, err){
		if(data.durationsec < 1){
			fs.unlink(path, _unlink);
			return;
		}
		if(data.video.codec == ''){
			fs.unlink(path, _unlink);
			return;
		}
		for(var i = 0; i < queue.length; i++)
			if(queue[i] == path)
				return;

		queue.push(path);
		if(!busy)
			_convert();
	});

	function _unlink(err){
		console.log(path + " was unlinked");
	}
}

/* -- convert -- */
function _convert(){
	busy = true;
	var path = queue[0];
	console.log("now converting " + path);

	var dest = rand.generateKey() + ".mp4";
	var bar = new ProgressBar('Converting [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 100
  });

	var proc = new FFmpeg({source:path})
	.usingPreset('360p')
	.on('error', function(err){
		console.log(err);
	})
	.on('progress', function(progress) {
			bar.update(progress.percent/100);
	})
	.on('end', function(){
		console.log("\n"+ dest + " converted");
		fs.unlink(path, _unlink);
	})
	.saveToFile('./out/'+dest);

	function _unlink(err){
		console.log(path + " was unlinked");
		queue.shift();
		if(queue.length){
			_convert();
		}else{
			busy = false;
		}
	}
}
