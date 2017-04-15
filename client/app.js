
var current_room;
var started = 0;
var currTrackName = "";
var client_port, client_playlist;


uploadToServer = function(){
	console.log("k")
	// Send File Element to upload
	var fileEl = document.getElementById('file');

	// Or just pass file objects directly
	var uploadIds = uploader.upload(fileEl.files);
	displayUpload(0);
}

var ub = document.getElementById("uploadbutton");
ub.addEventListener("click", uploadToServer);

var sb = document.getElementById("stylebutton");
sb.addEventListener("click", styleMenuTrig);

var rb = document.getElementById("roombutton");
rb.addEventListener("click", roomMenuTrig);

////////////////////////////////////////////////////////////////////////////////
// server ip 
////////////////////////////////////////////////////////////////////////////////

// var socket = io.connect('http://192.168.2.4:3000');
// var socket = io.connect('http://192.168.1.142:3000');
var socket = io.connect('http://localhost:3000');


////////////////////////////////////////////////////////////////////////////////
// socket io for client --> server binary file upload
////////////////////////////////////////////////////////////////////////////////

var uploader = new SocketIOFileClient(socket);

uploader.on('ready', function() {
	console.log('SocketIOFile ready to go!');
});

uploader.on('start', function(fileInfo) {
	console.log('Start uploading', fileInfo);
});

uploader.on('stream', function(fileInfo) {
	console.log('Streaming... sent ' + fileInfo.sent + ' bytes, ' + fileInfo.sent/fileInfo.size+' percent');
	var pcnt = fileInfo.sent/fileInfo.size;
	var elem = document.getElementById("listi");
	var width = Math.round(pcnt*100);
	elem.style.width = width + '%';
});

uploader.on('complete', function(fileInfo) {
	console.log('Upload Complete', fileInfo);
	var elem = document.getElementById("listi");
	var ul = document.getElementById("tracklist");
	elem.style.width = "100%";

	currTrackName = fileInfo.name;

	var ndx = (ul.getElementsByTagName("li").length - 1);
	removeSongFromList(ndx);
	
	console.log("are we atarted??? ", started)
	if(!started){
		socket.emit('start_radio', client_port);
		createAudioPlayer();	
		started = 1;
	}
});

uploader.on('error', function(err) {
	console.log('Error!', err);
});

uploader.on('abort', function(fileInfo) {
	console.log('Aborted: ', fileInfo);
});


////////////////////////////////////////////////////////////////////////////////
// socket io for client --> server chat and radio control
////////////////////////////////////////////////////////////////////////////////


socket.on('metadata', function(obj){
	console.log("metadata: ", obj.data.name);
	currTrackName = obj.data.name;
	addTrackFromServer(currTrackName);
});


socket.on('send_port', function(data){
	client_port = data;
	console.log("port received from server: ", client_port);

});

socket.on('send_playlist', function(data){
	client_playlist = data;
	console.log("playlist for this port: ", client_playlist.length, client_playlist);

	// if this room has tracks currently
	if(client_playlist.length > 0){
		// display each song in the playlist
		for(var i = 0; i < client_playlist; i++){
			displayTrack(client_playlist[i], 0);
		}
		// init the html5 audio player
		createAudioPlayer();
		started = 1;
	}
});



socket.on('connect', function(){
	// create a socket id and username
	var username = prompt("What's your name?")
	var id = socket.io.engine.id;
	// tell the server
	socket.emit('add_user', username, id);
});

socket.on('updatechat', function (username, data) {
	var chatul = document.getElementById("messages");
	var li = document.createElement('li');
	// random color
	var rndx = Math.floor(Math.random() * songBarColors.length);
	li.style.backgroundColor = chatWindowColors[rndx];
	// add chat message to window 
	li.innerHTML = '<b>' + username + ':</b> ' + data + '<br>';
	chatul.appendChild(li);
});



// client chat functionality
$(function(){
	// when the client clicks SEND
	$('#datasend').click( function() {
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

// AUDIO PLAYER FUNCTIONS

addTrackFromServer = function(trackToAdd){
	displayTrack(trackToAdd, 0);
};

addTrackFromFile = function(){
	var file_list = document.getElementById('file');
	for(var f = 0; f < file_list.files.length; f++){
		var file = file_list.files[f];
		// display with upload
		displayTrack(file.name, 1);
	}
}

displayTrack = function(trackname, uploading){
	// create the list item
	var msg = '<strong>'+escape(trackname.replace(/ /g,"_"))+'</strong>';
	var li = document.createElement('li');
	li.className = "listitem";	
	li.onclick = trackClicked;	
	li.id = "listi";
	// width of loading bar
	if(uploading){
		li.style.width = "10%";
	}else{
		li.style.width = "100%";
	}
	// random color
	var rndx = Math.floor(Math.random() * songBarColors.length);
	li.style.backgroundColor = songBarColors[rndx];
	li.innerHTML = msg;
	// append to list 
	var ul = document.getElementById("tracklist");
	ul.appendChild(li);
}

trackClicked = function (thetrack){
	console.log(thetrack.target);
};



var form = document.getElementById('form2');

form.onchange = function(ev) {
	addTrackFromFile();
};
form.onsubmit = function(ev) {
	ev.preventDefault();
}

removeSongFromList = function(id){
	var ul = document.getElementById("tracklist");
	ul.removeChild(ul.childNodes[id]);
}

// variable to store HTML5 audio element
var player;

createAudioPlayer = function (){


	// var msg = '<audio id="stream_player" src= "http://192.168.2.4:9000/stream">';
	// var msg = '<audio id="stream_player" src= "http://192.168.1.142:9000/stream">';
	var msg = '<audio id="stream_player" src= "http://localhost:'+client_port+'/stream">';
	var li = document.createElement('li');
	li.innerHTML = msg;

	player = document.getElementById("stream_player"); // get reference to player
	
	// play the station, if we are autoplaying
	if(autoplay){
		var pz = document.getElementById("playing");
		pz.appendChild(li);
		player.play();	
	}
	// add song name to play bar
	var songName = '<strong>'+escape(currTrackName.replace(/ /g,"_"))+'</strong>';
	document.getElementById("currentlyPlaying").innerHTML = songName;
}


playAudio = function() {
	var playpause;
	if(player.paused == false){
		playpause = document.getElementById("pButton"); // get reference to player
		// playpause.src = "./client/css/pause.png";
		playpause.className = "pause";
		console.log(playpause);
		player.pause();
		console.log("paused");
	}else{
		playpause = document.getElementById("pButton"); // get reference to player
		// playpause.src = "./client/css/play.png";
		playpause.className = "play";
		console.log(playpause);

		player.play()
		console.log("playing");
	}
}

setVolume = function(volume) {
	if(player){
		player.volume = volume;
	}
}
