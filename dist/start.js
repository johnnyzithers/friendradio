'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.start = undefined;

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hlsServer = require('hls-server');

var _hlsServer2 = _interopRequireDefault(_hlsServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// local js module filese
var u = require('./users.js');
var r = require('./rooms.js');

// these required for serving HLS public and sockete content
var app = (0, _express2.default)();
var server1 = require('http').createServer(app);
var server2 = require('http').createServer(app);
var io = require('socket.io')(server2);
var httpAttach = require('http-attach');
var commandExists = require('command-exists');

// these required for audio encoding
var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
var ffmpegOnProgress = require('ffmpeg-on-progress');
// set path to ffmpeg 
ffmpeg.setFfmpegPath(ffmpegPath);

// HLS Server
var hls = new _hlsServer2.default(server1, {
  path: '/streams', // Base URI to output HLS streams
  dir: './tmp' // Directory that input files are stored
});

// set up cors for hls server
function addCors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

// attach cors to the http server
httpAttach(server1, addCors);

var trackRoute = _express2.default.Router();
app.use(_express2.default.static('./public/'), (0, _cors2.default)());
app.use(_express2.default.static('./public/scripts'), (0, _cors2.default)());
app.use(_bodyParser2.default.json({
  limit: '500mb'
}));
app.use('/tracks', trackRoute);

// app.use(addCors);
// app.use(cors({
//   credentials: true,
//   origin: "http://localhost:3001"
// }));


// cant use memory storage with fluent ffmpeg, because this calls ffmpeg exec
var storage = _multer2.default.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, './uploads/mp3');
  },
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

// const PORT = 3001
// const MONGO_URL = 'mongodb://heroku_csm1p15v:rn77mngmt257a8qvjk7df0u798@ds331548.mlab.com:31548/heroku_csm1p15v'
//FIXME not safe, pass it in
var MONGO_URL = 'mongodb://localhost:27017/fr_test';
var HLS_UPLOAD_DIR = './uploads/hls/';
var UPLOAD_PATH = './uploads';
var upload = (0, _multer2.default)({ dest: UPLOAD_PATH + '/' }); // multer configuration

var db = void 0;

var uploadTrackNum = 0;
var streamTrackNum = 0;

var start = exports.start = function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:

          // invoked without a callback, it returns a promise
          commandExists('ffmpeg').then(function (command) {
            console.log("FFmpeg installed!");
          }).catch(function () {
            console.log("Error: FFmpeg is not installed. Please install FFmpeg!");
          });

          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(_mongodb.MongoClient.connect(MONGO_URL));

        case 4:
          db = _context.sent;


          // stream requeste route
          trackRoute.get('/:trackID', function (req, res) {
            // FIXME 
            console.log("streamTrackNum: " + streamTrackNum);
            try {
              var trackID = new _mongodb.ObjectID(req.params.trackID);
            } catch (err) {
              console.log(err);
              return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
            }

            var bucket = new _mongodb2.default.GridFSBucket(db, {
              bucketName: 'track' + streamTrackNum
            });

            // set the appropriate mongo collections
            var collection = db.collection('track' + streamTrackNum + '.files');

            // find all files
            collection.find({}).toArray(function (err, files) {
              // Error checking
              if (!files || files.length === 0) {
                return res.status(404).json({
                  responseCode: 1,
                  responseMessage: "error"
                });
              }
              // Loop through all the files and fetch the necessary information
              files.forEach(function (file) {
                bucket.openDownloadStreamByName(file.filename).pipe(_fs2.default.createWriteStream('./tmp/track' + streamTrackNum + '/' + file.filename)).on('error', function (error) {
                  _assert2.default.ifError(error);
                }).on('finish', function () {
                  // fired for each file
                });
              });
              streamTrackNum = streamTrackNum + 1;
              res.json(files);
              return res;
            });
          });

          // upload MP3 route 
          trackRoute.post('/:roomNum', function (req, res) {
            try {
              var rID = req.params.roomNum;
            } catch (err) {
              console.log(err);
              return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
            }

            var upload = (0, _multer2.default)({ storage: storage, limits: { fields: 1, fileSize: 9000000, files: 1, parts: 2 } });

            upload.single('track')(req, res, function (err) {
              if (err) {
                console.log(err);
                return res.status(400).json({ message: "Upload Request Validation Failed" });
              } else if (!req.body.name) {
                return res.status(400).json({ message: "No track name in request body" });
              } else if (typeof req.file == 'undefined') {
                return res.status(400).json({ message: "File not found. Are you sure you selected a file? " });
              } else {
                console.log("no upload error");
              }

              // path of mp3 on server, for ffmpeg
              var mp3Path = req.file.path;

              // use multer storage filename as mongo file names
              var filename = req.file.path.replace(/^.*[\\\/]/, '');

              // get reference to gridfs
              var bucket = new _mongodb2.default.GridFSBucket(db, {
                bucketName: 'track' + uploadTrackNum
              });
              uploadTrackNum = uploadTrackNum + 1;
              // callback function for saving ffmpeg files to db
              function trackStorageCallback() {

                _fs2.default.readdir('' + HLS_UPLOAD_DIR, function (err, files) {
                  if (err) throw err;
                  var count = 0;

                  files.forEach(function (file) {

                    // FIXME filtering out ds_store
                    if (file == ".DS_Store") {
                      console.log("trackStorageCallback() -- filtering .DS_Store...");
                    } else {
                      // stream the file to database using gridfs
                      _fs2.default.createReadStream('' + HLS_UPLOAD_DIR + file).pipe(bucket.openUploadStream(file)).on('error', function () {
                        console.log("Some error occured:" + error);
                        res.send(error);
                      }).on('finish', function () {
                        // FIXME validate all the files arrived
                      });
                    }
                  });
                });
                console.log("rid here is " + rID);
                // add this track to the room playlist          
                var room = r.getRoomMongo(rID).then(function (theroom) {
                  theroom.playlist.push({ uri: filename, name: req.body.name });
                  var result = r.updatePlaylist(rID, theroom.playlist);
                  return result;
                }).then(function (newplaylist) {

                  // send playlist to client
                  io.emit('playlist', { id: rID, playlist: newplaylist });
                  // remove tempory files once mongo upload complete
                  removeAllFilesFromDir("hls");
                  removeAllFilesFromDir("mp3");
                  // res.json(newplaylist)
                  res.status(201).json({ message: "HLS successfully uploaded" });
                  return res;
                }).catch(function (error) {
                  console.log('caught =>', error.message);
                });
              }

              // ffmpeg call to create the .m3u8 and .ts segments from mp3
              ffmpeg(mp3Path, { timeout: 432000 }).addOptions(['-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
              '-level 3.0', '-s 640x360', // 640px width, 360px height output video dimensions
              '-start_number 0', // start the first .ts segment at index 0
              '-hls_time 10', // 10 second segment duration
              '-hls_list_size 0', // Maxmimum number of playlist entries (0 means all entries/infinite)
              '-f hls' // HLS format
              ]).audioCodec('libmp3lame').on('error', function (err, stdout, stderr) {
                console.log('Error: ' + err.message);
                console.log('ffmpeg output:\n' + stdout);
                console.log('ffmpeg stderr:\n' + stderr);
              }).output('' + HLS_UPLOAD_DIR + filename + '.m3u8').on('end', trackStorageCallback).run();
            });
          });
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context['catch'](1);

          console.log(_context.t0);

        case 12:
        case 'end':
          return _context.stop();
      }
    }
  }, null, undefined, [[1, 9]]);
};

app.get('/playlist/:roomNum', function (req, res) {
  try {
    var rID = req.params.roomNum;
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid room num in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
  }

  var room = r.getRoomMongo(rID).then(function (theroom) {
    // send client their room id

    console.log("requesting playlist for room " + rID);
    console.log(theroom);
    res.status(201).json({ playlist: room.playlist }); // theroom.playlist.push({ uri: filename, name: req.body.name });
  }).catch(function (error) {
    console.log('caught', error.message);
  });
});

app.use('/newRoom/:roomNum/:adminUser', function (req, res) {
  try {
    var rID = req.params.roomNum;
  } catch (err) {
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

io.on('connection', function (socket) {

  var newuser = void 0;
  console.log('a user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });

  socket.on('setSocketId', function _callee2(data) {
    var userName, userId, newRoom;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            userName = data.name;
            userId = data.userId;


            userNames[userName] = userId;
            newuser = u.createUserMongo(userId);

            newRoom = r.createRoomMongo(newuser).then(function (room) {
              // send client their room id
              io.emit('room id', room._id);
            }).catch(function (error) {
              console.log(error, 'Promise error');
            });

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, this);
  });
});

// Helper function to delete files from dir
// this should be error checked to make sure only files in  this project can be removed
function removeAllFilesFromDir(directory) {

  _fs2.default.readdir(UPLOAD_PATH + "/" + directory, function (err, files) {
    files.forEach(function (file) {
      _fs2.default.unlink(UPLOAD_PATH + "/" + directory + "/" + file, function (err) {
        if (err) {
          console.log("Failed to delete local file from " + UPLOAD_PATH + " " + directory + ": " + err);
        } else {
          // console.log("successfully deleted local file from ./uploads/"+directory);                                
        }
      });
    });
  });
}
// console.log(process.env.PORT);

// app.set('port', process.env.PORT);  // for track uploading
server1.listen(3002); // for hls streaming 
server2.listen(3001); // for socket io