"use strict";
const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.Server(app);
const io = require('socket.io')(httpServer);
const SocketIOFile = require('socket.io-file');

const fs = require('fs');


// radio globals
var port = 9000;
// var playlist = [];
var playCount = 0;
var started = 0;

// chat globals
var usernames = {};									// usernames currently connected
var rooms = ['room1','room2','room3', 'room4'];		// rooms currently available 

var playlist1 = [];
var playlist2 = [];
var playlist3 = [];
var playlist4 = [];
var playlist5 = [];
var playlists = [playlist1, playlist2, playlist3, playlist4, playlist5];

///////////////////////////////////////////////////////////////////////////////////////////////
// SOCKET.IO FOR CLIENT
///////////////////////////////////////////////////////////////////////////////////////////////

app.use("/css", express.static(__dirname + '/client/css'));
app.use("/", express.static(__dirname + '/client/'));
app.get('/', (req, res, next) => {
	return res.sendFile(__dirname + '/client/index.html');    
});
app.get('/app.js', (req, res, next) => {
	return res.sendFile(__dirname + '/client/app.js');
});
app.get('/socket.io.js', (req, res, next) => {
	return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});
app.get('/socket.io-file-client.js', (req, res, next) => {
	return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

// io.on('streaming', function(data){
// 	console.log("!!! hello i am streaming", data);
// }); // listen to the event

// io.on('startradio', function(data){
// 	console.log("!!! hello i am streaming", data);
// }); // listen to the event

// ON CONNECTION, handles client --> server binary upload
io.sockets.on('connection', (socket) => {
	console.log('Socket connected.');

	var count = 0;
	var uploader = new SocketIOFile(socket, {
		// uploadDir: {			// multiple directories
		// 	music: 'data/music',
		// 	document: 'data/document'
		// },
		uploadDir: 'data',								// simple directory
		// accepts: ['audio/mpeg', 'audio/mp3'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
		// maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit)
		chunkSize: 10240,								// default is 10240(1KB)
		transmissionDelay: 0,							// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
		overwrite: false, 								// overwrite file if exists, default is true.
	});
	uploader.on('start', (fileInfo) => {
		console.log('Start uploading');
		console.log(fileInfo);
	});
	uploader.on('stream', (fileInfo) => {
		console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
	});
	uploader.on('complete', (fileInfo) => {
		console.log('Upload Complete.');

		// send metadata back to all clients for room FIXME
	  	socket.broadcast.emit('metadata', { data: fileInfo, status: 1 });
	  	// add song to the playlist 
	  	console.log("room number: ", socket.roomnum)
		playlists[socket.roomnum].push(fileInfo.uploadDir.substring());
		socket.emit('send_playlist', playlists[socket.roomnum]);

	  	console.log("this playlist: ", playlists[socket.roomnum], socket.roomnum);
	  	console.log("all playlists: ", playlists);

		// if(!socket.started){
		// 	startRadio(0, socket.port, socket.roomnum, socket.started);
		// 	socket.started = 1;
		// }
	});
	uploader.on('error', (err) => {
		console.log('Error!', err);
	});
	uploader.on('abort', (fileInfo) => {
		console.log('Aborted: ', fileInfo);
	});


 
 	// join this room
    socket.on('join_room', function(roomnum, username) {
		
		var room = 'room'+roomnum;
		socket.roomnum = roomnum;
		socket.join(room);
		// save this room in socket session for this client
		socket.room = room;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to '+room);
		// tell room user has joined
		socket.broadcast.to(room).emit('updatechat', 'SERVER', username + ' has connected to this room');
		// socket.emit('updaterooms', rooms, room);
		// send client its port
		console.log("joining ", room, 9000+socket.roomnum , "with playlist ", playlists[socket.roomnum ]);
		// save socket for this client 
		socket.port = 9000+socket.roomnum ;
		socket.started = 0;
		// socket.playlist = playlists[roomnum];				// attach playlist to socket session????


		// send port and playlist to client
		socket.emit('send_port', socket.port);
		socket.emit('send_playlist', playlists[socket.roomnum ]);

    });

 	// leave this room
    socket.on('leave_room', function(room) {
    	console.log("leaving room ", socket.roomnum , "with playlist ", playlists[socket.roomnum ]);
        socket.leave(room);
    });

	// play received from client
	socket.on('play', function(data){
		console.log("socket play");
		socket.started = 0;
		playCount = -1; //??
	});

	// get_port received from client
	socket.on('get_port', function(data){
		console.log("get_port request");
		io.sockets.emit('send_port', port);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('add_user', function(username, id){
		// store the username in the socket session for this client
		socket.username = username;
		socket.id = id;
		// add the client's username to the global list
		usernames[username] = username;
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('send_chat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	// when the client says 'start_radio'
	socket.on('start_radio', function(data){
		// this makes it so radio starts at first upload.. probably  need another button
		console.log("start_radio from client", data);
		console.log("started?", socket.started);
		if(!socket.started){
			initRadio();
			startRadio(0, socket.port, socket.roomnum, socket.started);
		}
	});
});


///////////////////////////////////////////////////////////////////////////////////////////////
// BASS AUDIO SETUP
///////////////////////////////////////////////////////////////////////////////////////////////



var bass = require('bassaudio'); 
var basslib = new bass();



function initRadio(){

	basslib.EnableMixer(true);
	if(basslib.MixerEnabled()){
		console.log("mixer is enabled.");
	}

	// get all sound cards 
	var cards = basslib.getDevices();
	console.log('total found sound cards:' + cards.length)

	// first item in array '[0]' is "no sound" , then use the item [1] 
	var card = cards[0];
	console.log(card.name + ' is enabled:' + card.enabled + ' ,IsDefault:' + card.IsDefault + ' , IsInitialized:' + card.IsInitialized + ' ,typeSpeakers:' + card.typeSpeakers)

	// [device],[freq],[flags] , -1 is default sound card 
	var result = basslib.BASS_Init(1,44100,basslib.BASS_Initflags.BASS_DEVICE_STEREO)
	if(!result){
		console.log('error init sound card:' + basslib.BASS_ErrorGetCode())
	}

	console.log("first card is initialized: " + basslib.getDevice(1).IsInitialized)



}


function startRadio(index, port, playlistnum, startflag){

	var started = startflag;
	// store the port so it play all over again
	var thisport = port;

	// use mixer as a trick, because if the channel freed or added new channel, the encoder stops itself.
	// add channels to mixer every time, and add mixer channel to encoder. so the encoder never stops..
	// enable mixer before using it!
	console.log("start radio")
	console.log("gonna play: ", playlists[playlistnum][index], " on port ",  thisport);
	
	var mixer  = basslib.BASS_Mixer_StreamCreate(44100, 2, basslib.BASSFlags.BASS_SAMPLE_FLOAT);
	var chan = basslib.BASS_StreamCreateFile(0, playlists[playlistnum][index], 0, 0, basslib.BASSFlags.BASS_STREAM_DECODE | basslib.BASSFlags.BASS_SAMPLE_FLOAT);
	var ok = basslib.BASS_Mixer_StreamAddChannel(mixer, chan, basslib.BASSFlags.BASS_SAMPLE_DEFAULT);
		
	basslib.EnableEncoder(true);
	var enc_chan = basslib.BASS_Encode_Start(mixer,'lame -r -m s -',basslib.BASS_Encode_Startflags.BASS_ENCODE_FP_16BIT);

	console.log("pong", ok);
	console.log("enchan error: " + basslib.BASS_ErrorGetCode()); // 0 is ok, 2 is fileopen
	console.log("started?", started, "playlist num", playlistnum);		 

	if(!started){
		started = 1;

		var result = basslib.BASS_Encode_CastInit(enc_chan,
		                                     'http://localhost:'+thisport+'/stream',
		                                     // 'http://192.168.1.142:'+port+'/stream',
		                                     'hackme',
		                                     basslib.BASS_Encode_CastInitcontentMIMEtypes.BASS_ENCODE_TYPE_MP3,
		                                     '', //name
		                                     '', //url
		                                     '', //genre
		                                     '', //desc
		                                     '',
		                                     44100,
		                                     true //public 

		                                     );

		 console.log("stream error?: " + basslib.BASS_ErrorGetCode(), result); // 0 is ok, 2 is fileopen
	}

	var any_error = basslib.BASS_ErrorGetCode();
	console.log("any_error: ", any_error);
	if(!any_error){
		// basslib.BASS_ChannelSetAttribute(mixer, basslib.BASS_ATTRIB_MUSIC_VOL_GLOBAL, 0.0);
		basslib.BASS_ChannelPlay(mixer, false);
		basslib.BASS_SetDevice(0);
		// io.emit('stream', { status: 1 });
		io.emit('update_current', { data: 1 });
	}


	// //lets make a callback when position reaches to 20. seconds. 
	// var Pos20SecondsBytePos=basslib.BASS_ChannelSeconds2Bytes(chan,5);
	// var proc20SecondsID=basslib.BASS_ChannelSetSync(mixer,basslib.BASS_ChannelSyncTypes.BASS_SYNC_POS,Pos20SecondsBytePos,function(handle,channel,data,user){
	// 	if(handle==proc20SecondsID){ 
	// 		console.log('position reached to the 20 seconds..')
	// 	}
	// })
	 
	// lets get the event when the position reaches to end 
	var procTOENDID=basslib.BASS_ChannelSetSync(chan,basslib.BASS_ChannelSyncTypes.BASS_SYNC_END,0,function(handle,channel,data,user){
		if(handle==procTOENDID){ 
			console.log('playback finished..');
			//delete last song

			playCount++;									// increment playlist counter
			if(playCount < playlists[playlistnum].length){
				startRadio(playCount, thisport, playlistnum, 1);
			}else{
				playCount = 0;
				startRadio(playCount, thisport, playlistnum, 1); 			// FIXME: just restarts when done
			}
		}
	});
}

function stopRadio(mixer){
	basslib.BASS_ChannelPlay(mixer, false);
	console.log("stop error: " + basslib.BASS_ErrorGetCode()); 
}


httpServer.listen(3000, () => {
	console.log('Server listening on port 3000');
});