'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updatePlaylist = updatePlaylist;
exports.getRoomMongo = getRoomMongo;
exports.createRoomMongo = createRoomMongo;
// import {MongoClient, ObjectID} from 'mongodb'
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var middleWare = require('middleWare');

var FR_ROOM_URL = 'mongodb://localhost:27017/fr_rooms';
var _exports = module.exports = {};
var db = void 0;

var roomIdNum = 0;

function updatePlaylist(o_id, newplaylist) {
  var collection, query, newvals, result;
  return regeneratorRuntime.async(function updatePlaylist$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(MongoClient.connect(FR_ROOM_URL));

        case 3:
          db = _context.sent;
          collection = db.collection('rooms');
          o_id = new ObjectId(o_id);
          query = { _id: o_id };
          newvals = { $set: { playlist: newplaylist } };
          _context.next = 10;
          return regeneratorRuntime.awrap(collection.updateOne(query, newvals));

        case 10:
          result = _context.sent;

          console.log("updatePlaylist(): updating playlist of room id: " + o_id);
          return _context.abrupt('return', newplaylist);

        case 15:
          _context.prev = 15;
          _context.t0 = _context['catch'](0);

          console.log(_context.t0);

        case 18:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this, [[0, 15]]);
}
function getRoomMongo(o_id) {
  var collection, result;
  return regeneratorRuntime.async(function getRoomMongo$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(MongoClient.connect(FR_ROOM_URL));

        case 3:
          db = _context2.sent;
          collection = db.collection('rooms');
          o_id = new ObjectId(o_id);

          console.log(+o_id);
          _context2.next = 9;
          return regeneratorRuntime.awrap(collection.findOne({ "_id": o_id }));

        case 9:
          result = _context2.sent;

          console.log("getRoomMongo(): finding room by id: " + result._id);
          return _context2.abrupt('return', result);

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2['catch'](0);

          console.log(_context2.t0);

        case 17:
        case 'end':
          return _context2.stop();
      }
    }
  }, null, this, [[0, 14]]);
}

function createRoomMongo(adminUser) {
  var newroom, collection, o_id, result;
  return regeneratorRuntime.async(function createRoomMongo$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          newroom = {
            playlist: [],
            admin: adminUser
          };
          _context3.next = 4;
          return regeneratorRuntime.awrap(MongoClient.connect(FR_ROOM_URL));

        case 4:
          db = _context3.sent;
          collection = db.collection('rooms');
          o_id = new ObjectId(o_id);
          _context3.next = 9;
          return regeneratorRuntime.awrap(collection.insertOne(newroom));

        case 9:
          result = _context3.sent;
          return _context3.abrupt('return', newroom);

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3['catch'](0);

          console.log(_context3.t0);

        case 16:
        case 'end':
          return _context3.stop();
      }
    }
  }, null, this, [[0, 13]]);
}

module.exports.createRoomMongo = createRoomMongo;
module.exports.updatePlaylist = updatePlaylist;
// module.exports.generateRoomID = generateRoomID; //FIXME doesnt need export
module.exports.getRoomMongo = getRoomMongo;