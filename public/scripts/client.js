var ROOM = 11231;
var currPlaylist = [];
var currTrack = 0;

$(function () {
    var socket = io();

	// create this new user    
	data = {name: "coolName28", userId: socket.id};
	socket.emit('setSocketId', data);

    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
    });
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

	    fetch('/tracks/'+ROOM, {
	        method: 'POST',
	        body: fd,
	    })
		.then(function(response) {	 	  
			return response.json();
		})
		.then(function(myJson) {
			// use socket io to signal others to upate playlist
			fetch('/playlist/'+ROOM, {
		        method: 'GET',
		    })
		    .then(function(response) {
		    	return response.json();
		    })
		    .then(function(jsonRes) {


		    	var stream_div = document.getElementById('stream');
		    	var playlist_div = document.getElementById('playlist');
		    	playlist_div.innerHTML = '';

		    	currPlaylist = jsonRes.playlist;

		    	for (var i = 0; i < currPlaylist.length; i++) {
		    	
	
					var trackName = document.createElement("li");
					var text = document.createTextNode(currPlaylist[i].name);
					trackName.appendChild(text);
					document.getElementById('playlist').appendChild(trackName);
		   //  		// stream_div.appendChild()
		    		stream_div.style.display = "block";
		    	}
		    	console.log(JSON.stringify(jsonRes));
		    });
		});
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
