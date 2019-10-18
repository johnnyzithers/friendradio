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
app.use('/tracks', trackRoute);

// mas body res size - therfore max mp3 size
app.use(bodyParser.json({
  limit: '500mb'
}));

// set up multer stogarge - must use disk storage
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/mp3')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

// paths
const MONGO_URL = 'mongodb://localhost:27017/fr_test'
const HLS_UPLOAD_DIR = './uploads/hls/';
const UPLOAD_PATH = './uploads';
const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

// FIXME these are dumb globals for dev
let db 
var uploadTrackNum = 0;
var streamTrackNum = 0;


export const start = async () => {
  
  // ensure ffmpeg installed
  commandExists('ffmpeg').then(function (command) {
    console.log("FFmpeg installed!");
  }).catch(function () {
    console.log("Error: FFmpeg is not installed. Please install FFmpeg!");
  });

  try 
  {
    // reference to the mongo database
    db = await MongoClient.connect(MONGO_URL);

    // stream request route
    trackRoute.get('/:trackID', (req, res) => {
      
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
        
          // add this track to the room playlist          
          var room = r.getRoomMongo(rID)
          .then(function(theroom)
          {
            theroom.playlist.push({ uri: filename, name: req.body.name });
            var result = r.updatePlaylist(rID, theroom.playlist);
            return result;
          }).then(function(newplaylist)
          {
            // send playlist to client
            io.emit('playlist', {id: rID, playlist: newplaylist});
            // remove tempory files once mongo upload complete
            removeAllFilesFromDir("hls");
            removeAllFilesFromDir("mp3");
            // and send the response
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
          .on('error', function(err, stdout, stderr) 
          {
            console.log('Error: ' + err.message);
            console.log('ffmpeg output:\n' + stdout);
            console.log('ffmpeg stderr:\n' + stderr);
          })
          .output(`${HLS_UPLOAD_DIR}`+filename+`.m3u8`).on('end', trackStorageCallback).run() 
      });
    });

    /* Creates a new room with adminUser
     *  @adminUser  - user with admin privledges
     *
     */
    app.use('/newRoom/:adminUser', function (req, res) {
      try {
        var user = req.params.adminUser;
      } catch(err) {
        console.log(err);
        return res.status(400).json({ message: "Invalid user for creating room!" }); 
      }

      // TODO get admin user
      var newRoom = r.createRoomMongo(newuser)
        .then(function(room){
          // send client their room id
          io.emit('room id', room._id);
        }).catch(function(error){
          console.log(error,'Promise error');
        });
      res.status(201).json({ room: newRoom.roomID });
    });

    /* Manages Socket.io connections and events 
     *
     */ 
    io.on('connection', function(socket){  
      
      /* Receives disconnect events from client 
       *
       */
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });

      /* Receives chat message events from client
       *  @msg.user - user posting the message
       *  @msg.room - room message is posted to
       *  @msg.data - text message contents
       */
      socket.on('chat message', function(msg){
        io.to(msg.room).emit('chat message', msg);
      });

      /* Receives new user events from client
       * (this also would be the login route)
       *  @data.user - new user posting the message
       *  @data.room - new room OR room the user is joining on login
       */
      socket.on('new user', async function(data) {
          console.log("new User: " + data.user + " " + data.room);
          
          // create a new user
          u.createUserMongo(data)
          .then(function (newuser){

            // save the username
            socket.name = newuser.username;
            
            if(data.room == "new room")
            {
              // and a new room for them
              var newRoom = r.createRoomMongo(newuser)
              .then(function(room){
                // join the room 
                socket.join(room._id);
                // send client their room id
                socket.emit('room id', room._id);
                // tell everyone else in the room
                io.to(room._id).emit('user joined', newuser.username);
              }).catch(function(error){
                console.log(error,'Promise error');
              });
              // otherwise we go to the room they entered
              // FIXME right now this by id, should be by url?
            }else{
              var theroom = r.getRoomMongo(data.room)
              .then(function(room){
                // join the room 
                socket.join(room._id);
                // send client their room id
                io.emit('room id', room._id);
                // tell everyone else in the room
                io.to(room._id).emit(newuser.username+' has joined the room');
              }).catch(function(error){
                console.log(error, 'Promise error');
              });
            }

          }).catch(function(error){
              console.log(error, 'Promise error');
          });

      });
    });
    
    } catch (e) {
    console.log(e)
  }
}

/* Helper function to delete files from dir
 * this should be error checked to make sure only files in  this project can be removed
 * FIXME this should be moved to utility module
 *  @directory - directory to be emptied
 */
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


