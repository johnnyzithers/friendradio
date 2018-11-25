// import io from 'socket.io-client';
var socket = io();
var id = 0;
window.chatWindowColors = ['#ccffff','#b3ffff','#99ffff','#80ffff','#66ffff']; 

// const socket = io('http://localhost');


window.newUser = function(ev)
{
	client_username = prompt("What's your name?");
	socket.emit('add_user', client_username, id++);
	return false;
};

socket.on('update_chat', function (username, data) {
	console.log("uc " + data);
	var chatul = document.getElementById("messages");
	var li = document.createElement('li');
	// random color
	var rndx = Math.floor(Math.random() * 3);
	li.style.backgroundColor = chatWindowColors[rndx];
	// add chat message to window 
	li.innerHTML = '<b>' + username + ':</b> ' + data + '<br>';
	chatul.appendChild(li);
});


socket.on('send_port', function(data){
	client_port = data;
	console.log("port received from server: ", client_port);
});


$(document).ready(function(){

	// client chat functionality
	$(function(){

   	
		// client clicks room
		$('#roombutton').click(function() {
			// TODO: figure out way to deal with room numbers
			socket.emit('join_room', 1);
		});

		// when the client clicks SEND
		$('#datasend').click(function() {
			var message = $('#data').val();

			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('send_chat', message);
		});

		// when the client hits ENTER on their keyboard
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});
	});

});








// var animation_enabled = 0;
// var client_username = "";
// var started = 0;
// var autoplay = 1;
// var currTrackName = "";
// var currentlyPlaying = 0;
// var client_port, client_playlist;
// var track_elems = [];
// var num_elems = 0;


// // import SocketIOFileClient from 'socket.io-file-client';
// // import 'socket.io-file';


// // window.$ = window.jquery = require("jquery");


// window.uploadToServer = function(){

	
// 	// Send File Element to upload
// 	var files_to_upload = document.getElementById('file');
// 	var uploadIds = uploader.upload(files_to_upload.files);
// 	num_elems = files_to_upload.files.length;

// 	// displayUpload(0);
// }



// $(document).ready(function () {

// 	console.log("!!!!");

// 	$('#pButton').css("background-image", "url(./img/play.png)");  

// 	var form = document.getElementById('form2');

// 	form.onchange = function(ev) {
// 		addTrackFromFile();				// when hit upload
// 		if(animation_enabled){
// 			animation_file();	
// 		}
		
// 	};

// 	form.onsubmit = function(ev) {
// 		ev.preventDefault();
// 	}
// 	var ub = document.getElementById("uploadbutton");
// 	ub.addEventListener("click", uploadToServer);

// 	var sb = document.getElementById("stylebutton");
// 	sb.addEventListener("click", window.styleMenuTrig);

// 	var rb = document.getElementById("roombutton");
// 	rb.addEventListener("click", window.roomMenuTrig);
// });


// ////////////////////////////////////////////////////////////////////////////////
// // server ip 
// ////////////////////////////////////////////////////////////////////////////////

// // var socket = io.connect('http://192.168.2.4:3000');
// // var socket = io.connect('http://192.168.1.142:3000');
// window.socket = io.connect('http://localhost:3000');


// ////////////////////////////////////////////////////////////////////////////////
// // socket io for client --> server binary file upload
// ////////////////////////////////////////////////////////////////////////////////

// var uploader = new SocketIOFileClient(socket);

// uploader.on('ready', function() {
// 	console.log('SocketIOFile ready to go!');
// });

// uploader.on('start', function(fileInfo) {
// 	console.log('Start uploading', fileInfo);
// });

// uploader.on('stream', function(fileInfo) {
// 	// console.log(tracknum+'   Streaming... sent ' + fileInfo.sent + ' bytes, ' + fileInfo.sent/fileInfo.size+' percent');
// 	var pcnt = fileInfo.sent/fileInfo.size;
// 	for(var j = 0; j < track_elems.length; j++){
// 		var elem = track_elems[j];
// 		var width = Math.round(pcnt*100);
// 		elem.style.width = width + '%';		
// 	}

// });

// uploader.on('complete', function(fileInfo) {
// 	removeSongFromList(0);
// });

// uploader.on('error', function(err) {
// 	console.log('Error!', err);
// });

// uploader.on('abort', function(fileInfo) {
// 	console.log('Aborted: ', fileInfo);
// });


// ////////////////////////////////////////////////////////////////////////////////
// // socket io for client --> server chat and radio control
// ////////////////////////////////////////////////////////////////////////////////


// socket.on('upload_complete', function(obj){
// 	console.log("upload_complete: ", obj.data.name);
// 	addTrackFromServer(obj.data.name);
// 	// initAudio();


// });

// socket.on('update_current', function(data){
// 	// removeSongFromList(0);
// 	currentlyPlaying++;
// });





// socket.on('update_playing', function(data){

// 	currTrackName = data.track.substring(5);
// 	console.log(currTrackName)
// 	// var songName = '<strong>'+escape(currTrackName.replace(/ /g,"_"))+'</strong>';
// 	var songName = '<strong>'+currTrackName+'</strong>';
// 	updateTrackName(songName);
// });


// socket.on('send_playlist', function(data){
// 	client_playlist = data;

// 	console.log("playlist for this port: ", client_playlist.length, client_playlist);


// 	// if this room has tracks currently
// 	if(client_playlist.length > 0){
// 		currTrackName = client_playlist[0];

// 		// display each song in the playlist
// 		for(var i = 0; i < client_playlist.length; i++){
// 			// have to create a new track for every playlist item
// 			track_elems.push(document.createElement('li'));
// 			displayTrack(client_playlist[i], 0, 1, i);
// 		}
// 		initAudio();

		
// 	}


// });


// window.initAudio = function(){
// 	// init the html5 audio player
// 	if(!started){
// 		socket.emit('start_radio', client_port);
// 		createAudioPlayer();
// 		started = 1;	
// 	}
// }

// // window.initAudio = initAudio;


// // window.newUser = newUser;


// socket.on('connect', function(){

	
// 	// $("#audioplayer").hide();
// 	// $("#drop_zone").hide();
// 	// $("#chat").hide();
// 	// $("#message").hide();
// 	// $("#roombutton").hide();
// 	// $("#audioplay").hide();
// 	// $("#pButton").hide();
// 	// $("#filebutton").hide();
// 	// $("#uploadbutton").hide();
// 	if(animation_enabled){
// 		animation_start();	
// 	}
	

// 	// create a socket id and username
// 	// var username = prompt("What's your name?")
// 	var id = socket.io.engine.id;
// });



// // AUDIO PLAYER FUNCTIONS
// var addCount = 0;

// var addTrackFromServer = function(trackToAdd){
// 	track_elems.pop();
// 	track_elems.push(document.createElement('li'));
// 	client_playlist.push(trackToAdd);
// 	// display without upload
// 	displayTrack(trackToAdd, 0, 1, track_elems.length-1);
// };

// var addTrackFromFile = function(){
// 	var file_list = document.getElementById('file');
// 	// console.log("file_list,", file_list.files.length)
// 	for(var f = 0; f < file_list.files.length; f++){
// 		track_elems[f] = document.createElement('li');
// 		var file = file_list.files[f];
// 		// display with upload
// 		displayTrack(file.name, 1, 0, f);
// 	}
// 	// tracknum = 0;
// }


// var displayTrack = function(trackname, uploading, fromserver, elem_ndx){


// 	console.log("displayTrack: ", uploading, trackname, "ELEM NDX: == ", elem_ndx);
// 	// create the list item

// 	var li = track_elems[elem_ndx];
// 	li.className = "listitem";	
// 	li.onclick = trackClicked;	
// 	li.id = "listi"+elem_ndx;
	
// 	// width of loading bar
// 	if(uploading){
// 		li.style.width = "10%";
// 		li.id = "listi"+elem_ndx;
// 	}else{
// 		trackname = trackname.substring(5);
// 		li.style.width = "100%";
// 	}

// 	// var msg = '<strong>'+escape(trackname.replace(/ /g,""))+'</strong>';
// 	// trackname = $.parseHTML(trackname);
// 	console.log(trackname)
// 	var msg = '<strong>'+trackname+'</strong>';

// 	// random color
// 	var rndx = Math.floor(Math.random() * songBarColors.length);
// 	li.style.backgroundColor = songBarColors[rndx];
// 	li.innerHTML = msg;

// 	// append to list 
// 	var ul = document.getElementById("tracklist");
// 	ul.appendChild(li);
// }

// var trackClicked = function (thetrack){
// 	console.log(thetrack.target);
// };



// var removeSongFromList = function(id){
// 	var ul = document.getElementById("tracklist");
// 	console.log("removeSongFromList: ", id)
// 	ul.removeChild(ul.childNodes[id]);

// }

// // variable to store HTML5 audio element

// var createAudioPlayer = function (){

// 	$('#divID').css("background-image", "url(/myimage.jpg)");  

// 	currTrackName = client_playlist[0];

// 	// var msg = '<audio id="stream_player" src= "http://192.168.2.4:9000/stream">';
// 	// var msg = '<audio id="stream_player" src= "http://192.168.1.142:9000/stream">';
// 	// var msg = '<audio id="stream_player" src="http://localhost:3000/ts/output1.M3U8" controls autoplay>';

// 	  if(Hls.isSupported()) {
// 	  	console.log("Er")
// 	    var stream = document.getElementById('stream_player');
// 	    var hls = new Hls();
// 	    hls.loadSource('http://www.streambox.fr/playlists/test_001/stream.m3u8');
// 	    hls.attachMedia(stream);
// 	    hls.on(Hls.Events.MANIFEST_PARSED,function() {
// 	      stream.play();
// 	  });
// 	 }


// 	var li = document.createElement('li');
// 	li.innerHTML = msg;
// 	// li.innerHTML = "!"
// 	li.id = "list_play";			// so we can remove it roomMenu.js
	

// 	var pz = document.getElementById("playing");
// 	pz.appendChild(li);



// 	// // play the station, if we are autoplaying
	
// 	// if(autoplay){
// 	// 	var player = document.getElementById("stream_player"); // get reference to player
// 	// 	player.play();	
// 	// }

// 	// add song name to play bar
// 	// var tempname = $.parseHTML(currTrackName);
// 	// var songName = '<strong>'+escape(currTrackName.replace(/ /g,"_"))+'</strong>';
// 	// var songName = '<strong>'+currTrackName+'</strong>';
// 	// updateTrackName(songName);
// }


// var updateTrackName = function(newname){
// 	document.getElementById("currentlyPlaying").innerHTML = newname;
// }

// window.playAudio = function() {

// 	var player = document.getElementById("stream_player"); // get reference to player
	


// 	var playpause;
// 	if(player.paused == false){
// 		playpause = document.getElementById("pButton"); // get reference to player

		

// 		playpause.className = "pause";
// 		player.pause();
// 		console.log("paused");
// 	}else{
// 		playpause = document.getElementById("pButton"); // get reference to player

		

// 		playpause.className = "play";
// 		player.play()
// 		console.log("playing");
// 	}
// }

// window.setVolume = function(volume) {
// 	var player = document.getElementById("stream_player"); 
// 	if(player){
// 		player.volume = volume;
// 	}
// }


// window.onbeforeunload = function (e) {
// 	console.log("leaving!!!!");
// }

