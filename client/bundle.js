(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var socket = io.connect('http://localhost:3000');
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('form2');
var ul = document.getElementById("list");
var pz = document.getElementById("playing");

var partyColors = ['#F400BA', 'EBF80E', 'FF0048', '09F7CF', '04106E'];
var greens = ['#70E26C','#7AC960','#78B259','#509E63','#3C896C'];
var songBarColors = partyColors;

uploader.on('ready', function() {
	console.log('SocketIOFile ready to go!');
});
uploader.on('start', function(fileInfo) {
	console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
	console.log('Streaming... sent ' + fileInfo.sent + ' bytes, ' + fileInfo.sent/fileInfo.size+' percent');
});
uploader.on('complete', function(fileInfo) {
	console.log('Upload Complete', fileInfo);
});
uploader.on('error', function(err) {
	console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
	console.log('Aborted: ', fileInfo);
});


form.onchange = function(ev) {
	var file_list = document.getElementById('file');

	for(var f = 0; f < file_list.files.length; f++){
		console.log(f, file_list.files[f]);
		var file = file_list.files[f];
		var msg = '<strong>'+escape(file.name.replace(/ /g,"_"))+'</strong> - '+file.size+' bytes.';

		var li = document.createElement('li');
		li.className = "listitem";

		var rndx = Math.floor(Math.random() * songBarColors.length);
		console.log(rndx, songBarColors[rndx]);
		li.style.backgroundColor = songBarColors[rndx];
		li.innerHTML = msg;
		ul.appendChild(li);
	}
};

form.onsubmit = function(ev) {
	ev.preventDefault();
	
	// Send File Element to upload
	var fileEl = document.getElementById('file');
	// var uploadIds = uploader.upload(fileEl);

	// Or just pass file objects directly
	var uploadIds = uploader.upload(fileEl.files);
};


socket.on('stream', function (data) {
  console.log(data);
  grabStream();
  socket.emit('ok I am listening now', { my: 'data' });
});

// var icy = require('icy');
// // var fs = require('fs');
// // var lame = require('lame');
// // var Speaker = require('speaker');

// // var io = require('socket.io')

// function grabStream(){
// 	console.log("ok");
// 	// URL to a known ICY stream
// 	// var url = 'http://localhost:9000/';
// 	var url = 'http://firewall.pulsradio.com';

// 	// connect to the remote stream
// 	icy.get(url, function (res) {

// 		// log the HTTP response headers
// 		console.error(res.headers);

// 		// // log any "metadata" events that happen
// 		// res.on('metadata', function (metadata) {
// 		// 	var parsed = icy.parse(metadata);
// 		// 	console.error(parsed);
// 		// });

// 		// // Let's play the music (assuming MP3 data).
// 		// // lame decodes and Speaker sends to speakers!
// 		// res.pipe(new lame.Decoder())
// 		//  	.pipe(new Speaker());
// 		// });

// 	});
// }

function grabStream(){

	// const Parser = require('icecast-parser');
	 
	// const radioStation = new Parser('http://localhost:9000/stream');
	 
	// radioStation.on('metadata', function(metadata) {
	//     console.log([metadata.StreamTitle, 'is playing on', this.getConfig('url')].join(' '));
	// });

// <audio controls src="http://shoutcast.internet-radio.org.uk:10272/;"></audio>


	var msg = '<audio controls id="stream_player" src= "http://localhost:9000/stream">';
	var li = document.createElement('li');
	li.innerHTML = msg;
	pz.appendChild(li);

	// const Parser = require('icecast-parser');

	// console.log("Ever?")
	 
	// const radioStation = new Parser({
	//     url: 'http://localhost:9000/stream', // URL to radio station 
	//     keepListen: true, // don't listen radio station after metadata was received 
	//     autoUpdate: true, // update metadata after interval 
	//     errorInterval: 10 * 60, // retry connection after 10 minutes 
	//     emptyInterval: 5 * 60, // retry get metadata after 5 minutes 
	//     metadataInterval: 5 // update metadata after 5 seconds 
	// });
	 
	// radioStation.on('metadata', function(metadata) {
	//     console.log('Here you will receive metadata each 10 seconds');
	//     console.log(metadata.StreamTitle);
	// });	
}

},{}]},{},[1]);
