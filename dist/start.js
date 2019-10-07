// import {MongoClient, ObjectID} from 'mongodb'
// import express from 'express'
// import bodyParser from 'body-parser'
// import cors from 'cors'
// import {prepare} from "../util/index"
// import assert from 'assert'
// import fs from 'fs'
// import mongodb from 'mongodb'
// import multer from 'multer'
// import path from 'path'
// import HLSServer from 'hls-server'

// const ffmpegPath  = require('@ffmpeg-installer/ffmpeg').path;
// const ffmpeg      = require('fluent-ffmpeg');
// const ffmpegOnProgress = require('ffmpeg-on-progress')
// const app         = express(); 

// var   server1      = require('http').createServer(app);
// var   server2     = require('http').createServer(app);

// // HLS Server
// var hls = new HLSServer(server1, {
//   path: '/streams',     // Base URI to output HLS streams
//   dir: './tmp'           // Directory that input files are stored
// })

// var   io          = require('socket.io')(server2);
// var   httpAttach  = require('http-attach')


// ffmpeg.setFfmpegPath(ffmpegPath);

// function addCors (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next()
// }


// var uploadTrackNum = 0;
// var streamTrackNum = 0;

// const trackRoute = express.Router()
// app.use(express.static('./public/'), cors());
// app.use(express.static('./public/scripts'), cors());
// app.use(bodyParser.json({
//   limit: '500mb'
// }));
// app.use('/tracks', trackRoute);

// app.use(addCors);
// app.use(cors({
//   credentials: true,
//   origin: "http://localhost:3001"
// }));

// httpAttach(server1, addCors)

// // cant use memory storage with fluent ffmpeg, because this calls ffmpeg exec
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/mp3')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// })

// // const PORT = 3001
// // const MONGO_URL = 'mongodb://heroku_csm1p15v:rn77mngmt257a8qvjk7df0u798@ds331548.mlab.com:31548/heroku_csm1p15v'
// const MONGO_URL = process.env.MONGO_URL;
// const HLS_UPLOAD_DIR = './uploads/hls/';
// const UPLOAD_PATH = './uploads';
// const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

// let db

// //FIXME this should be in a different higher level db
// // for now just stubbing out the data we will need
// var rooms = [];

// function Room(_roomID, _playlist, _particpants)
// {
//   this.roomID         = _roomID;
//   this.playlist       = _playlist;
//   this.particpants    = _particpants;
// }

// // FIXME dummy this just creates 2 rooms with different ids
// function initRooms()
// {
//     var q = [];
//     var id = 11231;
//     var p = 0;
//     var r = new Room( id, q, p);
//     rooms[0] = r;
//     id = 10429;
//     var s = new Room( id, q, p);
//     rooms[1] = s;
//     console.log(rooms)
// }

// initRooms();


// export const start = async () => {
//   try 
//   {
//     // // reference to the mongo database
//     // db = await MongoClient.connect(MONGO_URL);

//     // // route for streaming track by ID
//     // trackRoute.get('/:trackID', (req, res) => {
//     //   // FIXME 
//     //   console.log("streamTrackNum: " + streamTrackNum);
//     //   try {
//     //     var trackID = new ObjectID(req.params.trackID);
//     //   } catch(err) {
//     //     console.log(err);
//     //     return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
//     //   }

//     //   let bucket = new mongodb.GridFSBucket(db, {
//     //     bucketName: 'track'+streamTrackNum
//     //   });

//     //   // set the appropriate mongo collections
//     //   const collection = db.collection('track'+streamTrackNum+'.files');    

//     //   // find all files
//     //   collection.find({}).toArray((err, files) => {
//     //     // Error checking
//     //     if(!files || files.length === 0){
//     //         return res.status(404).json({
//     //             responseCode: 1,
//     //             responseMessage: "error"
//     //         });
//     //     }
//     //     // Loop through all the files and fetch the necessary information
//     //     files.forEach((file) => {

//     //       bucket.openDownloadStreamByName(file.filename)
//     //       .pipe(fs.createWriteStream('./tmp/track'+streamTrackNum+'/'+file.filename))
//     //       .on('error', function(error) {
//     //         assert.ifError(error);
//     //       })
//     //       .on('finish', function() {
//     //           // fired for each file
//     //       });       
//     //     });
//     //     streamTrackNum = streamTrackNum + 1;
//     //     res.json(files);
//     //     return res;
//     //   });
//     // });

//     // // upload tracks 
//     // trackRoute.post('/:roomNum', (req, res) => {
//     //  try {
//     //     var rID = req.params.roomNum;
//     //   } catch(err) {
//     //     console.log(err);
//     //     return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
//     //   }

//     //   const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 9000000, files: 1, parts: 2}});

//     //   upload.single('track')(req, res, (err) => {  
//     //     if (err) {
//     //       console.log(err); 
//     //       return res.status(400).json({ message: "Upload Request Validation Failed" });
//     //     } else if (!req.body.name) {
//     //       return res.status(400).json({ message: "No track name in request body" });
//     //     } else if (typeof(req.file) == 'undefined'){
//     //       return res.status(400).json({ message: "File not found. Are you sure you selected a file? "});
//     //     } else {
//     //       console.log("no upload error");
//     //     }

//     //     // path of mp3 on server, for ffmpeg
//     //     let mp3Path = req.file.path;

//     //     // use multer storage filename as mongo file names
//     //     let filename = req.file.path.replace(/^.*[\\\/]/, '');

//     //     // get reference to gridfs
//     //     let bucket = new mongodb.GridFSBucket(db, {
//     //       bucketName: 'track'+uploadTrackNum
//     //     });
//     //     uploadTrackNum = uploadTrackNum + 1;
//     //     // callback function for saving ffmpeg files to db
//     //     function trackStorageCallback()
//     //     {

//     //       fs.readdir(`${HLS_UPLOAD_DIR}`,function(err,files){
//     //         if(err) throw err;
//     //         var count = 0;

//     //         files.forEach(function(file){

//     //           // FIXME filtering out ds_store
//     //           if (file == ".DS_Store"){
//     //             console.log("trackStorageCallback() -- filtering .DS_Store...");
//     //           // }
//     //           // else if (file == "output.m3u8") {

//     //           } else {``
//     //             // stream the file to database using gridfs
//     //             fs.createReadStream(`${HLS_UPLOAD_DIR}`+file)
//     //             .pipe(bucket.openUploadStream(file))
//     //             .on('error', ()=>{
//     //                 console.log("Some error occured:"+error);
//     //                 res.send(error);
//     //             })
//     //             .on('finish', ()=>{
//     //                 // FIXME validate all the files arrived
//     //             });
//     //           }
//     //         });
//     //       });
//     //       res.status(201).json({ message: "HLS files successfully uploaded to mongo: "});

//     //       // add this track to the room playlist
//     //       // FIXME better way to do this
//     //       var room = rooms.find(function(r) {
//     //         return r.roomID ==  rID;
//     //       });
//     //       room.playlist.push({ uri: filename, name: req.body.name });
//     //       console.log("adding "+ req.body.name + " to room " + room.roomID);

//     //       // remove tempory files once mongo upload complete
//     //       removeAllFilesFromDir("hls");
//     //       removeAllFilesFromDir("mp3");

//     //       // and return the response
//     //       return res;
//     //     }

//     //     // ffmpeg call to create the .m3u8 and .ts segments from mp3
//     //     ffmpeg(mp3Path, { timeout: 432000 }).addOptions([

//     //           '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
//     //           '-level 3.0', 
//     //           '-s 640x360',          // 640px width, 360px height output video dimensions
//     //           '-start_number 0',     // start the first .ts segment at index 0
//     //           '-hls_time 10',        // 10 second segment duration
//     //           '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
//     //           '-f hls'               // HLS format
//     //       ])
//     //       .audioCodec('libmp3lame')
//     //       .on('error', function(err, stdout, stderr) {
//     //         console.log('Error: ' + err.message);
//     //         console.log('ffmpeg output:\n' + stdout);
//     //         console.log('ffmpeg stderr:\n' + stderr);
//     //       })
//     //       .output(`${HLS_UPLOAD_DIR}`+filename+`.m3u8`).on('end', trackStorageCallback).run() 
//     //   });
//     // });
//   } catch (e) {
//     console.log(e)
//   }
// }

// app.get('/playlist/:roomNum', function (req, res) {
//   try {
//     var rID = req.params.roomNum;
//   } catch(err) {
//     console.log(err);
//     return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
//   }
//   var room = rooms.find(function(r) {
//     return r.roomID ==  rID;
//   });

//   console.log("requesting playlist for room "+rID);
//   res.status(201).json({ playlist: room.playlist});
// });

// app.use('/newRoom/:roomNum', function (req, res) {
//   try {
//     var rID = req.params.roomNum;
//   } catch(err) {
//     console.log(err);
//     return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
//   }

//   // // create DBs for new room and new playlist
//   // const collection = db.collection('rooms');

//   // var newRoom = [
//   //   { roomID: rID, playlist: [] }
//   // ];

//   // db.collection("employees").insertOne(myobj, function(err, res) {  
//   //   if (err) throw err;  
//   //   console.log("1 record inserted");  
//   //   db.close();  
//   // });  

//   res.status(201).json({ room: newRoom.roomID });
// });


// io.on('connection', function(socket){
//   console.log('a user connected');

//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });

//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });

// });

// // Helper function to delete files from dir
// // this should be error checked to make sure only files in  this project can be removed
// function removeAllFilesFromDir(directory) {

//   fs.readdir(UPLOAD_PATH+"/"+directory, (err, files) => {
//     files.forEach(file => {
//       fs.unlink(UPLOAD_PATH+"/"+directory+"/"+file, (err) => {
//         if (err) {
//             console.log("Failed to delete local file from "+UPLOAD_PATH+" "+directory+": "+err);
//         } else {
//             // console.log("successfully deleted local file from ./uploads/"+directory);                                
//         }
//       });
//     });
//   });
// }

// app.set('port', 3001);  // for track uploading
// server1.listen(3002);   // for hls streaming 
// server2.listen(3001);   // for socket io
"use strict";