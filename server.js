// /**
//  * NPM Module dependencies.
//  */

const express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});



const trackRoute = express.Router();
const multer = require('multer');

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


const { Readable } = require('stream');

var port = 3005;

/**
 * Create Express server && Express Router configuration.
 */
app.use('/tracks', trackRoute);

app.use(express.static(__dirname + '/client/'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/app.js', (req, res, next) => {
	return res.sendFile(__dirname + '/client/app.js');
});

app.use("/css", express.static(__dirname + '/client/css'));


/**
 * Connect Mongo Driver to MongoDB.
 */
let db;
MongoClient.connect('mongodb://localhost/mydatabase', (err, database) => {
  if (err) {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
  }
  db = database;
});

/**
 * GET /tracks/:trackID
 */
trackRoute.get('/:trackID', (req, res) => {
  try {
    var trackID = new ObjectID(req.params.trackID);
  } catch(err) {
    return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
  }
  res.set('content-type', 'audio/mp3');
  res.set('accept-ranges', 'bytes');

  let bucket = new mongodb.GridFSBucket(db, {
    bucketName: 'tracks'
  });

  let downloadStream = bucket.openDownloadStream(trackID);

  downloadStream.on('data', (chunk) => {
    res.write(chunk);
  });

  downloadStream.on('error', () => {
    res.sendStatus(404);
  });

  downloadStream.on('end', () => {
    res.end();
  });
});

/**
 * POST /tracks
 */
trackRoute.post('/', (req, res) => {
  const storage = multer.memoryStorage()
  const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 }});
  upload.single('track')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "Upload Request Validation Failed" });
    } else if(!req.body.name) {
      return res.status(400).json({ message: "No track name in request body" });
    }
    
    let trackName = req.body.name;
    
    // Covert buffer to Readable Stream
    const readableTrackStream = new Readable();
    readableTrackStream.push(req.file.buffer);
    readableTrackStream.push(null);

    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'tracks'
    });

    let uploadStream = bucket.openUploadStream(trackName);
    let id = uploadStream.id;
    readableTrackStream.pipe(uploadStream);

    uploadStream.on('error', () => {
      return res.status(500).json({ message: "Error uploading file" });
    });

    uploadStream.on('finish', () => {
      return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
    });
  });
});



io.on('connection', function(socket)
{
    // join room
    socket.on('join_room', function(roomnum) 
    {	  
			socket.roomnum = roomnum;
			var room = 'room'+socket.roomnum;
			socket.join(room);
			// save this room in socket session for this client
			socket.room = room;
			// tell room user has joined
	    socket.broadcast.emit('update_chat', 'SERVER', socket.username + ' has connected to this room');
			// send client its port
			socket.port = 3000+socket.roomnum;
			// send port and playlist to client
			socket.emit('send_port', socket.port);
    });

    // leave room
    socket.on('leave_room', function(room) {
    	socket.leave(room);
    	console.log("leaving room");
    });
	
  	// play received from client
  	socket.on('play', function(data){
  		console.log("socket play");
  		started = 0;
  		playCount = -1;
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
      console.log("user: " + username);
  		// add the client's username to the global list
  	});

  	// when the client emits 'sendchat', this listens and executes
  	socket.on('send_chat', function (data) {

	    socket.broadcast.emit('update_chat',socket.username,data);
  	});

  	// when the client says 'start_radio'
  	socket.on('start_radio', function(data){

  	});
});

http.listen(3005, function(){
  console.log('listening on *:3005');
});


// app.listen(port, () => {
//   console.log("App listening on port "+port+"!");
// });
