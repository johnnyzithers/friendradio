// import 'socket.io-file'
// import 'so' 'socket.io'
// var socket = require("socket.io-client");

var current_room;		
var menuState = 0;

// roomMenuTrig(event)
// triggered by "+room" button
// displays or hides the menus
//
window.roomMenuTrig = function(ev){
	if(!menuState){
		document.getElementById("roomMenu").style.display = "inline-block";
	}else{
		document.getElementById("roomMenu").style.display = "none";
	}
	menuState = !menuState;
}

// roomButtonPressed(room)
// triggered by "room1", "room2".. buttons
//
window.roomButtonPressed = function(room){
	console.log("room button", room);

	// first stop animation
	// if(animation_enabled){
	// 	animation_room();				// stopp animation	
	// }
	
	$("#drop_zone").show();
	$("#chat").show();
	$("#message").show();

	$("#filebutton").show();
	$("#uploadbutton").show();

	// if we are in a room, leave it
	if(current_room){
		socket.emit('leave_room', current_room);
		// clear the chat, player, and tracklist html
		clearTrackList();
		clearAudioPlayer();
		clearChat();
	}
	// join this room
	current_room = room;	
	socket.emit('join_room', room);
	roomMenuTrig({});

	// remove audio player and song name when changing room
	var li = document.getElementById('list_play');
	if(li){
		var pz = document.getElementById("playing");
		var cp = document.getElementById("currentlyPlaying");
		cp.innerHTML = '';
		pz.removeChild(li);
	}

	// radio is now off, because new station
	started = 0;
	// tracknukm = 0;

	var player = document.getElementById("stream_player")
	// // create a new audio player so port is updated
	if(player != undefined){
		createAudioPlayer();
	}
}


// clearTrackList()
// called by roomButtonPressed()
// clear tracklist html
//
var clearTrackList = function(){
	var ul = document.getElementById("tracklist");
	ul.innerHTML = "";
}

// clearTrackList()
// called by roomButtonPressed()
// clear track li html 
//
var clearAudioPlayer = function(){
	var pz = document.getElementById("playing");	
	var track = pz.getElementsByTagName("li");
	track.innerHTML = "";
}


// clearChat()
// called by roomButtonPressed()
// clear list item 
//
var clearChat = function(){
	var chatul = document.getElementById("messages");
	chatul.innerHTML = "";
}