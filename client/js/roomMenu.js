


var menuState = 0;

// roomMenuTrig(event)
// triggered by "+room" button
// displays or hides the menus
//
roomMenuTrig = function(ev){
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
roomButtonPressed = function(room){
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
	socket.emit('room', room);
	roomMenuTrig({});
}


// clearTrackList()
// called by roomButtonPressed()
// clear tracklist html
//
clearTrackList = function(){
	var ul = document.getElementById("tracklist");
	ul.innerHTML = "";
}

// clearTrackList()
// called by roomButtonPressed()
// clear track li html 
//
clearAudioPlayer = function(){
	var pz = document.getElementById("playing");	
	var track = pz.getElementsByTagName("li");
	track.innerHTML = "";
}


// clearChat()
// called by roomButtonPressed()
// clear list item 
//
clearChat = function(){
	var chatul = document.getElementById("messages");
	chatul.innerHTML = "";
}