var currPlaylist = [];
var currTrack = 0;

var uname;


$(document).ready(function() 
{
    var socket = io();

	socket.on('connect', () => {
		// create this new user    
		if (uname == null){
			uname = prompt("Please enter a user name", "coolName28");
			room = prompt("Which room would you like to go to?", "new room");
			data = {user: uname, room: room};
			socket.username = data.user;
			socket.room = room;
			socket.emit('new login', data);
		}
	});
    
    socket.on('chat message', function(msg){
      	$('#messages').append($('<li>').text(msg.user + ": " + msg.data));
    });

    socket.on('playlist', function(pl){

    	//fixme check if id is this room
    	currPlaylist = pl.playlist;
    	var stream_div = document.getElementById('stream');
		var playlist_div = document.getElementById('playlist');
		playlist_div.innerHTML = '';

		for (var i = 0; i < currPlaylist.length; i++) {

			var trackName = document.createElement("li");
			var text = document.createTextNode(currPlaylist[i].name);
			trackName.appendChild(text);
			document.getElementById('playlist').appendChild(trackName);
		//  		// stream_div.appendChild()
			stream_div.style.display = "block";
		}
    });

    socket.on('room id', function(roomid){
    	console.log("this room is " + roomid);
    	socket.room = roomid;
    });

    socket.on('room endpoint', function(roomend){
    	console.log('room endpoint is ' + roomend);
    	socket.roomendpoint = roomend;
    });

    socket.on('user joined', function(user){
		$('#messages').append($(`<li style="font-style:italic;font-size:20px;\">`).text(user +" has joined the room"));
    });
  

    $('form').submit(function(e){
		e.preventDefault(); // prevents page reloading
		var msg = {
			data: $('#m').val(), 
			user: socket.username,
			room: socket.room
		};
		socket.emit('chat message', msg);
		$('#m').val('');
		return false;
    });

	function getStream(){
		console.log("getStream()");
		
		// fetch pulls down all the MONGO hls files for this track
	 	fetch('/tracks/'+socket.room+"/"+currTrack, {
	        method: 'GET',
	    })
		.then(function(response) {	 	  
			return response.json();
		})
		.then(function(myJson) {
		
			var video_div = document.getElementById('video_div');
			video_div.innerHTML = '';
			var video = document.createElement('video');
			video.setAttribute("height", "70");				// dumb just the controls show
			video.setAttribute("width", "100%");				// dumb just the controls show
			video.setAttribute("controls", "controls");

			video.addEventListener('ended',myHandler,false);
			function myHandler(e) {
				// What you want to do after the event
				console.log("... next track!");
				currTrack = currTrack + 1;
				if (currTrack < currPlaylist.length) {
					getStream();
				}

			}
			video_div.appendChild(video);
			if(Hls.isSupported()) 
			{
				console.log(document.location.pathname);
				var hls = new Hls();
				hls.attachMedia(video);
				// explain this
				hls.loadSource('http://localhost:3002/streams/'+socket.roomendpoint+'/'+currTrack+'/'+currPlaylist[currTrack].uri+'.m3u8');
		        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
		          console.log("manifest loaded, found " + data.levels.length + " quality level");
		        });
			}	
			video.play();
		});

	}

	function postStream(file){
		console.log("postStream()");

		var file = document.querySelector('[type=file]').files[0];
	    var fd = new FormData();
	    fd.set("track", file);
    	fd.set("name",  file.name);

    	console.log("post with rid "+socket.room);

	    fetch('/tracks/'+socket.room, {
	        method: 'POST',
	        body: fd,
	    })
		.then(function(response) {	 	  
			return response.json();
		})
		// .then(function(myJson) {
		// 	// use socket io to signal others to upate playlist
		// 	// fetch('/playlist/'+socket.room, {
		//  //        method: 'GET',
		//  //    })
		//  //    .then(function(response) {
		//  //    	console.log(response)
		//  //    	return response.json();
		//  //    })
		// });
	}

	$(".btn2").click(function (){
   		getStream();
	});

	$(".btn1").click(function (){
		// get the file
		const file = document.querySelector('[type=file]').files[0];

		if (typeof(file) == 'undefined') {
			// throw error?
		} else {
			postStream(file)
		}
	});	 
});
