var r_id;
var currPlaylist = [];
var currTrack = 0;

var user;

$(function () {
    var socket = io();

	socket.on('connect', () => {
		// create this new user    
		if (user == null){
			data = {name: "coolName28", userId: socket.id};
			console.log("new user: " + data.name + " " + data.userId);
			socket.emit('newUser', data);
		}
	});



    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
    
    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
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
    	r_id = roomid;
    })
  });


$(document).ready(function() 
{
	console.log("FRIENDRADIO client!");

	function getStream(){
		console.log("getStream()");

		// FIXME dummy ID
		var id = '5d7d70bbac0481659f11dd32';

		// fetch pulls down all the MONGO hls files for this track
	 	fetch('/tracks/'+id, {
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
				hls.loadSource('http://localhost:3002/streams/track'+currTrack+'/'+currPlaylist[currTrack].uri+'.m3u8');
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

    	console.log("post with rid "+r_id);

	    fetch('/tracks/'+r_id, {
	        method: 'POST',
	        body: fd,
	    })
		.then(function(response) {	 	  
			return response.json();
		})
		// .then(function(myJson) {
		// 	// use socket io to signal others to upate playlist
		// 	// fetch('/playlist/'+r_id, {
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
