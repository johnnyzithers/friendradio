import {MongoClient, ObjectID} from 'mongodb'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import assert from 'assert'
import fs from 'fs'
import mongodb from 'mongodb'
import multer from 'multer'
import path from 'path'
import HLSServer from 'hls-server'

// local js module filese
const u  = require('./users.js')
const r  = require('./rooms.js')

// these required for serving HLS public and sockete content
const app         = express(); 
var   server1     = require('http').createServer(app);
var   server2     = require('http').createServer(app);
var   io          = require('socket.io')(server2);
var   httpAttach  = require('http-attach')
var commandExists = require('command-exists');

// these required for audio encoding
const ffmpegPath        = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg            = require('fluent-ffmpeg');
const ffmpegOnProgress  = require('ffmpeg-on-progress')
// set path to ffmpeg 
ffmpeg.setFfmpegPath(ffmpegPath);

// HLS Server
var hls = new HLSServer(server1, {
  path: '/streams',       // Base URI to output HLS streams
  dir: './tmp'            // Directory that input files are stored
})

// set up cors for hls server
function addCors (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
}

// attach cors to the http server
httpAttach(server1, addCors)



const trackRoute = express.Router()
app.use(express.static('./public/'), cors());
app.use(express.static('./public/scripts'), cors());
app.use(bodyParser.json({
  limit: '500mb'
}));
app.use('/tracks', trackRoute);

// app.use(addCors);
// app.use(cors({
//   credentials: true,
//   origin: "http://localhost:3001"
// }));


// cant use memory storage with fluent ffmpeg, because this calls ffmpeg exec
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/mp3')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

// const PORT = 3001
// const MONGO_URL = 'mongodb://heroku_csm1p15v:rn77mngmt257a8qvjk7df0u798@ds331548.mlab.com:31548/heroku_csm1p15v'
//FIXME not safe, pass it in
const MONGO_URL = 'mongodb://localhost:27017/fr_test'
const HLS_UPLOAD_DIR = './uploads/hls/';
const UPLOAD_PATH = './uploads';
const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

let db 



var uploadTrackNum = 0;
var streamTrackNum = 0;



export const start = async () => {

  // invoked without a callback, it returns a promise
  commandExists('ffmpeg').then(function (command) {
    console.log("FFmpeg installed!");
  }).catch(function () {
    console.log("Error: FFmpeg is not installed. Please install FFmpeg!");
  });

  try 
  {
    // reference to the mongo database
    db = await MongoClient.connect(MONGO_URL);

    // stream requeste route
    trackRoute.get('/:trackID', (req, res) => {
      // FIXME 
      console.log("streamTrackNum: " + streamTrackNum);
      try {
        var trackID = new ObjectID(req.params.trackID);
      } catch(err) {
        console.log(err);
        return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
      }

      let bucket = new mongodb.GridFSBucket(db, {
        bucketName: 'track'+streamTrackNum
      });

      // set the appropriate mongo collections
      const collection = db.collection('track'+streamTrackNum+'.files');    

      // find all files
      collection.find({}).toArray((err, files) => {
        // Error checking
        if(!files || files.length === 0){
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        // Loop through all the files and fetch the necessary information
        files.forEach((file) => {
          bucket.openDownloadStreamByName(file.filename)
          .pipe(fs.createWriteStream('./tmp/track'+streamTrackNum+'/'+file.filename))
          .on('error', function(error) {
            assert.ifError(error);
          })
          .on('finish', function() {
              // fired for each file
          });       
        });
        streamTrackNum = streamTrackNum + 1;
        res.json(files);
        return res;
      });
    });

    // upload MP3 route 
    trackRoute.post('/:roomNum', (req, res) => {
     try {
        var rID = req.params.roomNum;
      } catch(err) {
        console.log(err);
        return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
      }

      const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 9000000, files: 1, parts: 2}});

      upload.single('track')(req, res, (err) => {  
        if (err) {
          console.log(err); 
          return res.status(400).json({ message: "Upload Request Validation Failed" });
        } else if (!req.body.name) {
          return res.status(400).json({ message: "No track name in request body" });
        } else if (typeof(req.file) == 'undefined'){
          return res.status(400).json({ message: "File not found. Are you sure you selected a file? "});
        } else {
          console.log("no upload error");
        }
          
        // path of mp3 on server, for ffmpeg
        let mp3Path = req.file.path;

        // use multer storage filename as mongo file names
        let filename = req.file.path.replace(/^.*[\\\/]/, '');

        // get reference to gridfs
        let bucket = new mongodb.GridFSBucket(db, {
          bucketName: 'track'+uploadTrackNum
        });
        uploadTrackNum = uploadTrackNum + 1;
        // callback function for saving ffmpeg files to db
        function trackStorageCallback()
        {

          fs.readdir(`${HLS_UPLOAD_DIR}`,function(err,files){
            if(err) throw err;
            var count = 0;

            files.forEach(function(file){
              
              // FIXME filtering out ds_store
              if (file == ".DS_Store"){
                console.log("trackStorageCallback() -- filtering .DS_Store...");
              } else {
                // stream the file to database using gridfs
                fs.createReadStream(`${HLS_UPLOAD_DIR}`+file)
                .pipe(bucket.openUploadStream(file))
                .on('error', ()=>{
                    console.log("Some error occured:"+error);
                    res.send(error);
                })
                .on('finish', ()=>{
                    // FIXME validate all the files arrived
                });
              }
            });
          });
          console.log("rid here is " + rID)
          // add this track to the room playlist          
          var room = r.getRoomMongo(rID)
          .then(function(theroom){
            theroom.playlist.push({ uri: filename, name: req.body.name });
            var result = r.updatePlaylist(rID, theroom.playlist);
            return result;
          }).then(function(newplaylist){
            
            // send playlist to client
            io.emit('playlist', {id: rID, playlist: newplaylist});
            // remove tempory files once mongo upload complete
            removeAllFilesFromDir("hls");
            removeAllFilesFromDir("mp3");
            // res.json(newplaylist)
            res.status(201).json({ message: "HLS successfully uploaded"});
            return res;
          }).catch(error => { console.log('caught =>', error.message); });
        }

        // ffmpeg call to create the .m3u8 and .ts segments from mp3
        ffmpeg(mp3Path, { timeout: 432000 }).addOptions([
	
              '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
              '-level 3.0', 
              '-s 640x360',          // 640px width, 360px height output video dimensions
              '-start_number 0',     // start the first .ts segment at index 0
              '-hls_time 10',        // 10 second segment duration
              '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
              '-f hls'               // HLS format
          ])
          .audioCodec('libmp3lame')
          .on('error', function(err, stdout, stderr) {
            console.log('Error: ' + err.message);
            console.log('ffmpeg output:\n' + stdout);
            console.log('ffmpeg stderr:\n' + stderr);
          })
          .output(`${HLS_UPLOAD_DIR}`+filename+`.m3u8`).on('end', trackStorageCallback).run() 
      });
    });
  } catch (e) {
    console.log(e)
  }
}

app.get('/playlist/:roomNum', function (req, res) {
  try {
    var rID = req.params.roomNum;
  } catch(err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
  }

  var room = r.getRoomMongo(rID)
  .then(function(theroom){
      // send client their room id

    console.log("requesting playlist for room "+rID);
    console.log(theroom)
    res.status(201).json({ playlist: room.playlist});    // theroom.playlist.push({ uri: filename, name: req.body.name });

  }).  catch(error => { console.log('caught', error.message); });
  
});

app.use('/newRoom/:roomNum/:adminUser', function (req, res) {
  try {
    var rID = req.params.roomNum;
  } catch(err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
  }

  // // create DBs for new room and new playlist
  // const collection = db.collection('rooms');

  // var newRoom = [
  //   { roomID: rID, playlist: [] }
  // ];

  // db.collection("employees").insertOne(myobj, function(err, res) {  
  //   if (err) throw err;  
  //   console.log("1 record inserted");  
  //   db.close();  
  // });  

  res.status(201).json({ room: newRoom.roomID });
});

//FIXME mongo
var userNames = {};

io.on('connection', function(socket){
  
  let newuser;
  console.log('a user connected');
  

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('setSocketId', async function(data) {

      var userName = data.name;
      var userId = data.userId;

      userNames[userName] = userId;
      newuser = u.createUserMongo(userId);

      var newRoom = r.createRoomMongo(newuser)
        .then(function(room){
          // send client their room id
          io.emit('room id', room._id);
        }).catch(function(error){
          console.log(error,'Promise error');
        });
  });
});

// Helper function to delete files from dir
// this should be error checked to make sure only files in  this project can be removed
function removeAllFilesFromDir(directory) {

  fs.readdir(UPLOAD_PATH+"/"+directory, (err, files) => {
    files.forEach(file => {
      fs.unlink(UPLOAD_PATH+"/"+directory+"/"+file, (err) => {
        if (err) {
            console.log("Failed to delete local file from "+UPLOAD_PATH+" "+directory+": "+err);
        } else {
            // console.log("successfully deleted local file from ./uploads/"+directory);                                
        }
      });
    });
  });
}
// console.log(process.env.PORT);

// app.set('port', process.env.PORT);  // for track uploading
server1.listen(3002);   // for hls streaming 
server2.listen(3001);   // for socket io


