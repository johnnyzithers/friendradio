var tracknum = 0;


var started = 0;
var autoplay = 1;
var currTrackName = "";
var client_port, client_playlist;

var track_elems = [];
var num_elems = 0;
uploadToServer = function(){
	
	// Send File Element to upload
	var files_to_upload = document.getElementById('file');
	var uploadIds = uploader.upload(files_to_upload.files);
	num_elems = files_to_upload.files.length;

	// displayUpload(0);
}

var form = document.getElementById('form2');

var ub = document.getElementById("uploadbutton");
ub.addEventListener("click", uploadToServer);

var sb = document.getElementById("stylebutton");
sb.addEventListener("click", styleMenuTrig);

var rb = document.getElementById("room_button");
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
	// console.log(tracknum+'   Streaming... sent ' + fileInfo.sent + ' bytes, ' + fileInfo.sent/fileInfo.size+' percent');
	var pcnt = fileInfo.sent/fileInfo.size;

	// var elem = client_playlist[client_playlist.length-1]
	// var elem = document.getElementById("listi"+tracknum);
	for(var j = 0; j < track_elems.length; j++){
		var elem = track_elems[j];
		var width = Math.round(pcnt*100);
		elem.style.width = width + '%';		
	}

});

uploader.on('complete', function(fileInfo) {
	console.log(tracknum, 'Upload Complete', fileInfo);
	// removeSongFromList(0);
	currTrackName = fileInfo.name;
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
	

	// removeSongFromList(0);
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
		for(var i = 0; i < client_playlist.length; i++){
			displayTrack(client_playlist[i], 0, 1, i);
		}
		// init the html5 audio player
		if(!started){
			socket.emit('start_radio', client_port);
			createAudioPlayer();
			started = 1;	
		}
	}
});


newUser = function(ev){
 //  	$( "#dialog" ).dialog({

	//   buttons: [
	//     {
	//       text: "OK",
	//       icons: {
	//         primary: "ui-icon-check"
	//       },

	//       click: function() {

	//       	var name = $('input[name="name"]').val();
	// 	    console.log("	@31231231",name, anim_type, anim_id);
	//         $( this ).dialog( "close" );

	        $("#animation_container").hide();
			$("#animation_container").css("top","150px");
			$("#animation_container").show();
			document.getElementById("anim_label").innerHTML = "choose a room";
			
			anim_type = 0;     	
	        clearInterval(anim_id);				// stopp animation
			startAnimation();	   

	//       }
	//     }
	//   ]
	// });


	 username = prompt("What's your name?")
};


var anim_id;
function startAnimation() {
    var elem = document.getElementById("animation"); 
    var pos = 0;
    anim_id = setInterval(frame, 20);
    var goingLeft;
    function frame() {
    	if(pos == -20){
    		goingLeft = 1;
    	}
    	if(pos == 0){
    		goingLeft = 0;
    	}
        if (goingLeft) {
            pos++;
            elem.style.left = pos + 'px'
        } else {
            pos--; 
            // elem.style.top = pos + 'px'; 
            elem.style.left = pos + 'px'; 
        }
    }
}

socket.on('connect', function(){

	
	// $("#audioplayer").hide();
	$("#drop_zone").hide();
	$("#chat").hide();
	$("#message").hide();
	// $("#room_button").hide();
	$("#rngVolume").hide();
	$("#pButton").hide();
	// $("#filebutton").hide();
	// $("#uploadbutton").hide();

	anim_type = 1;
	startAnimation();

	// create a socket id and username
	// var username = prompt("What's your name?")
	var id = socket.io.engine.id;
	// tell the server
	// socket.emit('add_user', username, id);
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
var addCount = 0;

addTrackFromServer = function(trackToAdd){
	track_elems.pop();

	track_elems.push(document.createElement('li'));
	// display without upload
	displayTrack(trackToAdd, 0, 1, track_elems.length-1);
};

addTrackFromFile = function(){
	var file_list = document.getElementById('file');
	// console.log("file_list,", file_list.files.length)
	for(var f = 0; f < file_list.files.length; f++){
		track_elems[f] = document.createElement('li');
		var file = file_list.files[f];
		// display with upload
		displayTrack(file.name, 1, 0, f);
	}
	// tracknum = 0;
}


displayTrack = function(trackname, uploading, fromserver, elem_ndx){


	// console.log("displayTrack: ", uploading, trackname, "ELEM NDX: == ", elem_ndx);
	// create the list item
	var msg = '<strong>'+escape(trackname.replace(/ /g,"_"))+'</strong>';

	var li = track_elems[elem_ndx];
	li.className = "listitem";	
	li.onclick = trackClicked;	
	li.id = "listi"+elem_ndx;
	// width of loading bar
	if(uploading){
		li.style.width = "10%";
		li.id = "listi"+elem_ndx;

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




form.onchange = function(ev) {
	addTrackFromFile();				// when hit upload
};
form.onsubmit = function(ev) {
	ev.preventDefault();
}

removeSongFromList = function(id){
	var ul = document.getElementById("tracklist");
	ul.removeChild(ul.childNodes[id]);

}

// variable to store HTML5 audio element

createAudioPlayer = function (){


	// var msg = '<audio id="stream_player" src= "http://192.168.2.4:9000/stream">';
	// var msg = '<audio id="stream_player" src= "http://192.168.1.142:9000/stream">';
	var msg = '<audio id="stream_player" src= "http://localhost:'+client_port+'/stream">';
	
	console.log("createing audio playering")


	var li = document.createElement('li');
	li.innerHTML = msg;
	li.id = "list_play";			// so we can remove it roomMenu.js
	var pz = document.getElementById("playing");
	pz.appendChild(li);
	// // play the station, if we are autoplaying
	
	if(autoplay){
		var player = document.getElementById("stream_player"); // get reference to player
		player.play();	
	}
	// add song name to play bar
	var songName = '<strong>'+escape(currTrackName.replace(/ /g,"_"))+'</strong>';
	document.getElementById("currentlyPlaying").innerHTML = songName;
}


playAudio = function() {
	var player = document.getElementById("stream_player"); // get reference to player
	var playpause;
	if(player.paused == false){
		playpause = document.getElementById("pButton"); // get reference to player
		// playpause.src = "./client/css/pause.png";
		playpause.className = "pause";
		player.pause();
		console.log("paused");
	}else{
		playpause = document.getElementById("pButton"); // get reference to player
		// playpause.src = "./client/css/play.png";
		playpause.className = "play";
		player.play()
		console.log("playing");
	}
}

setVolume = function(volume) {
	var player = document.getElementById("stream_player"); 
	if(player){
		player.volume = volume;
	}
}
