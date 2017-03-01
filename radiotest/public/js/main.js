var socket = io();
var bass = require('bassaudio');        // bass library module



var ul;
// window.onload=function(it){
$(document).ready(function() {

	var dropZone = document.getElementById('drop_zone');
	var playButton = document.getElementById('play');
	var fx = document.getElementById('effects');
	var prog = document.getElementById('progress_bar');
	ul = document.getElementById("list");


	// link js routines to dom events
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
	playButton.addEventListener('click', startRadio);

});

$('form').submit(function(){
	socket.emit('chatmessage', $('#m').val());
	$('#m').val('');
	return false;
});

socket.on('chatmessage', function(msg){
	console.log("msg:", msg)
	$('#messages').append($('<li>').text(msg));
});



// https://www.html5rocks.com/en/tutorials/file/dndfiles/

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
	// Great success! All the File APIs are supported.
} else {
	alert('The File APIs are not fully supported in this browser.');
}

var context = new(window.AudioContext || window.webkitAudioContext)();
var playlist = [];

var feedback = context.createGain();
var delay = context.createDelay(5.0);
var delayLevel = context.createGain();
var feedback = context.createGain();

var radioStarted = 0;

var currSample = 0;
function startRadio(raw) {
  

	// first time called
	if(!radioStarted){
		console.log("starting radio");
		radioStarted = 1;
	}else if(radioStarted){
		console.log("radio alread started, nothing left to play!");
	}

  	if(currSample < playlist.length){
	    // // console.log("now playing a sound, that starts with", new Uint8Array(raw.slice(0, 10)));
	    context.decodeAudioData(playlist[currSample], function (buffer) {
	        if (!buffer) {
	            console.error("failed to decode:", "buffer null");
	            return;
	        }

	        // create new source node
	        var source = context.createBufferSource();

	        // connect nodes
	        source.connect(context.destination);      
	        source.connect(delay);
	        delay.connect(delayLevel);
	        delayLevel.connect(context.destination);
	        delay.connect(feedback);
	        feedback.connect(delay);
	        
	        // set web audio parameters
			feedback.gain.value = 0.3;
	        source.buffer = buffer;
	        delayLevel.gain.value = 0.0;
	        delay.delayTime.value = 0.37;
			source.start();

	        source.onended = function(){

	        	source.disconnect();
	        	delay.disconnect();
	        	console.log("       ...ended");
	        	currSample++;
	        	if(currSample < playlist.length){
		        	startRadio();
	        	}else{
	        		return;
	        	}
	        }
	        console.log("started...");
	    }, function (error) {
	        console.error("failed to decode:", error);
	    });  		
  	}
}







var reader;
var progress = document.querySelector('.percent');

function abortRead() {
	reader.abort();
}


function errorHandler(evt) {
	switch(evt.target.error.code) {
		case evt.target.error.NOT_FOUND_ERR:
		    alert('File Not Found!');
		    break;
		case evt.target.error.NOT_READABLE_ERR:
		    alert('File is not readable');
		    break;
		case evt.target.error.ABORT_ERR:
		    break; // noop
		default:
		    alert('An error occurred reading this file.');
	};
}

// called when reading file
function updateProgress(evt) {
	// evt is an ProgressEvent.
	if (evt.lengthComputable) {
		var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
		// Increase the progress bar length.
		if (percentLoaded < 100) {
			progress.style.width = percentLoaded + '%';
			progress.textContent = percentLoaded + '%';
		}
	}
}

var filename;

// called when file is dropped
function handleFileSelect(evt, callback) {
	evt.stopPropagation();
	evt.preventDefault();

    var filesL = evt.target.files; // FileList object
	var files = evt.dataTransfer.files; // FileList object.

	// files is a FileList of File objects. List some properties.
	var output = [];

	var res;
	// for each file 
	for (var i = 0, f; f = files[i]; i++) {
	    output.push('<li class="listitem"><strong>', escape(f.name.replace(/ /g,"_")), '</strong> - ',
	                  f.size, ' bytes.', 
	                  '</li>');

		// Reset progress indicator on new file selection.
	    progress.style.width = '0%';
	    progress.textContent = '0%';

	    reader = new FileReader();
	    reader.onerror = errorHandler;
	    reader.onprogress = updateProgress;

	    filename =  escape(f.name.replace(/ /g,"_"));

	    reader.onabort = function(e) {
			alert('File read cancelled');
	    };
	    reader.onloadstart = function(e) {
			document.getElementById('progress_bar').className = 'loading';
	    };
	    reader.onload = function(e) {
			// Ensure that the progress bar displays 100% at the end.
			progress.style.width = '100%';
			progress.textContent =  filename;
			res = reader.result;
			playlist.push(e.target.result);
			// this erases the progress bar once it is complete			
			setTimeout("document.getElementById('progress_bar').className='';", 2000);
			// remove percent bar
			progress.style.display = 'none';
	    }

	    // Read in the image file as a binary string.
	    // reader.readAsBinaryString(f);
	    reader.readAsArrayBuffer(evt.dataTransfer.files[i]);
	    // reader.readAsArrayBuffer();
	}

	var li = document.createElement('li');
	li.innerHTML = output.join('');
	ul.appendChild(li);

}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}






// for FX shit

var mouseDown = 0;
$( "#effects" ).mousedown(function() {
  mouseDown = !mouseDown;
});

$( "#effects" ).mousemove(function() {
  if(mouseDown){
  	console.log(mouseY, (1-((180 - mouseY))/150));
  	// 180 - 30

  	delay.delayTime.value = 1-((1-(180 - mouseY))/150)*4.0;
  	delayLevel.gain.value = ((180 - mouseY)/150);
  }
});

var mouseX, mouseY;
$("body").mousemove(function(e) {
	mouseX = e.pageX;
	mouseY = e.pageY;
})

