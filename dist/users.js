'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// import {MongoClient, ObjectID} from 'mongodb'
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

var FR_USER_URL = 'mongodb://localhost:27017/fr_users';
var _exports = module.exports = {};

var db = void 0;
var userIdNum = 0;

function generateUserID() {
  return userIdNum++;
}

var createUserMongo = exports.createUserMongo = function _callee(u_id) {
  var collection, newUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(u_id);
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(MongoClient.connect(FR_USER_URL));

        case 4:
          db = _context.sent;
          collection = db.collection('users');
          newUser = {
            username: [],
            // id: u_id,
            since: Date.now()
            // etc
          };


          console.log("new user " + newUser.id);

          // playlist
          // users

          return _context.abrupt('return', newUser);

        case 11:
          _context.prev = 11;
          _context.t0 = _context['catch'](1);

          console.log(_context.t0);

        case 14:
        case 'end':
          return _context.stop();
      }
    }
  }, null, undefined, [[1, 11]]);
};

module.exports.userIdNum = userIdNum;

module.exports.createUserMongo = createUserMongo;
// module.exports.generateUserID = generateUserID;